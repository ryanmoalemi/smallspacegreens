/* Pure seed-calculator math. No network. No DOM. */
var SSG_G_PER_OZ = 28.349523125;
var SSG_G_PER_LB = 453.59237;
var SSG_REF_AREA = 200;

function ssgFinite(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function ssgCompute(input) {
  var tray = input.tray;
  var length = Number(input.length);
  var width = Number(input.width);
  var unit = input.unit === "cm" ? "cm" : "in";
  var trays = Number(input.trays);
  var crop = input.crop || {};
  var maxSide = unit === "cm" ? 120 : 48;

  if (tray === "custom") {
    if (!ssgFinite(length) || !ssgFinite(width) || length < 0.1 || width < 0.1) {
      return { ok: false, error: "Enter a length and width of at least 0.1 in the selected units." };
    }
    if (length > maxSide || width > maxSide) {
      return { ok: false, error: "That side is outside the supported range (up to 48 inches or 120 cm)." };
    }
  }

  var area;
  var areaLabel;
  if (tray === "10x20") {
    area = 200;
    areaLabel = "10 by 20 inches (200 square inches, nominal)";
  } else if (tray === "10x10") {
    area = 100;
    areaLabel = "10 by 10 inches (100 square inches, nominal)";
  } else if (tray === "5x5") {
    area = 25;
    areaLabel = "5 by 5 inches (25 square inches, nominal)";
  } else if (tray === "custom") {
    var lIn = unit === "cm" ? length / 2.54 : length;
    var wIn = unit === "cm" ? width / 2.54 : width;
    area = lIn * wIn;
    if (!ssgFinite(area) || area <= 0) {
      return { ok: false, error: "Those dimensions do not make a usable area." };
    }
    var unitLabel = unit === "cm" ? "cm" : "inches";
    areaLabel = length + " by " + width + " " + unitLabel + " (" + ssgFormatArea(area) + " square inches)";
  } else {
    return { ok: false, error: "Choose a tray size." };
  }

  if (!ssgFinite(trays) || trays < 1 || Math.floor(trays) !== trays) {
    return { ok: false, error: "Enter a whole number of trays, at least 1." };
  }
  if (trays > 200) {
    return { ok: false, error: "This calculator supports up to 200 trays at a time." };
  }

  var rate = ssgRate(crop, input);
  if (!rate.ok) return rate;

  var factor = area / SSG_REF_AREA;
  var perLow = rate.low * factor;
  var perHigh = rate.high * factor;
  if (!ssgFinite(perLow) || !ssgFinite(perHigh)) {
    return { ok: false, error: "That combination is too large to calculate. Use a smaller tray or fewer trays." };
  }

  var priceMode = input.priceMode || "unit";
  var cost = null;
  if (priceMode === "package") {
    var packPrice = input.packagePrice === "" || input.packagePrice == null ? null : Number(input.packagePrice);
    var packGrams = input.packageGrams === "" || input.packageGrams == null ? null : Number(input.packageGrams);
    if (packPrice == null && packGrams == null) {
      cost = { kind: "blank" };
    } else if (!ssgFinite(packPrice) || packPrice < 0 || packPrice > 10000) {
      return { ok: false, error: "Enter a package price of zero or a positive number up to 10000." };
    } else if (!ssgFinite(packGrams) || packGrams < 0.1 || packGrams > 50000) {
      return { ok: false, error: "Enter a package weight from 0.1 to 50000 grams." };
    } else {
      cost = ssgPackageCost(perLow, perHigh, trays, packPrice, packGrams);
    }
  } else {
    var raw = input.price;
    if (raw === "" || raw == null) {
      cost = { kind: "blank" };
    } else {
      var price = Number(raw);
      if (!ssgFinite(price) || price < 0 || price > 10000) {
        return { ok: false, error: "Enter a seed price of zero or a positive number up to 10000." };
      }
      var priceUnit = input.priceUnit === "oz" || input.priceUnit === "kg" ? input.priceUnit : "lb";
      cost = {
        kind: "unit",
        priceUnit: priceUnit,
        perLow: ssgUnitCost(perLow, price, priceUnit),
        perHigh: ssgUnitCost(perHigh, price, priceUnit),
        totalLow: ssgUnitCost(perLow * trays, price, priceUnit),
        totalHigh: ssgUnitCost(perHigh * trays, price, priceUnit)
      };
    }
  }

  return {
    ok: true,
    area: area,
    areaLabel: areaLabel,
    trays: trays,
    perLow: perLow,
    perHigh: perHigh,
    totalLow: perLow * trays,
    totalHigh: perHigh * trays,
    rateNote: rate.note,
    evidence: rate.evidence,
    generic: !!rate.generic,
    cost: cost
  };
}

function ssgRate(crop, input) {
  if (crop.needsRate) {
    if (!input.useExample && (input.userLow === "" || input.userLow == null)) {
      return {
        ok: false,
        error: "This crop has no crop-specific gram rate in the Utah State table. Enter your own grams per 10 by 20 inch tray, or choose the labeled Maryland example."
      };
    }
    var low = input.useExample ? 10 : Number(input.userLow);
    var high = input.useExample ? 15 : (input.userHigh === "" || input.userHigh == null ? low : Number(input.userHigh));
    if (!ssgFinite(low) || !ssgFinite(high) || low < 0.1 || high < 0.1 || low > 500 || high > 500) {
      return { ok: false, error: "Enter a sowing rate from 0.1 to 500 grams per 10 by 20 inch tray." };
    }
    if (high < low) {
      var swap = low;
      low = high;
      high = swap;
    }
    return {
      ok: true,
      low: low,
      high: high,
      generic: true,
      evidence: input.useExample ? "general-example" : "user-entered",
      note: input.useExample
        ? "You chose the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. That band is not a weighed rate for this crop."
        : "You entered this rate. It is not a crop-specific figure from the Utah State table."
    };
  }
  if (ssgFinite(crop.grams)) {
    return {
      ok: true,
      low: crop.grams,
      high: crop.grams,
      generic: false,
      evidence: "crop-rate",
      note: crop.source || ""
    };
  }
  return { ok: false, error: "Choose a crop." };
}

function ssgUnitCost(grams, price, unit) {
  if (unit === "lb") return (grams / SSG_G_PER_LB) * price;
  if (unit === "oz") return (grams / SSG_G_PER_OZ) * price;
  return (grams / 1000) * price;
}

function ssgPackageCost(perLow, perHigh, trays, price, packGrams) {
  function scenario(per) {
    var needed = per * trays;
    var complete = Math.floor(packGrams / per + 1e-12);
    var packages = Math.ceil(needed / packGrams - 1e-12);
    if (!ssgFinite(packages) || packages < 1) packages = 1;
    var leftover = Math.max(0, packages * packGrams - needed);
    return {
      needed: needed,
      completeTrays: complete,
      packages: packages,
      leftover: leftover,
      consumed: (needed / packGrams) * price,
      checkout: packages * price
    };
  }
  return { kind: "package", low: scenario(perLow), high: scenario(perHigh), packGrams: packGrams, price: price };
}

function ssgFormatArea(n) {
  if (!ssgFinite(n)) return "";
  if (n > 0 && n < 0.01) return "< 0.01";
  var digits = n >= 100 ? 0 : n >= 1 ? 2 : 3;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function ssgFormatGrams(n) {
  if (!ssgFinite(n)) return "";
  if (n > 0 && n < 0.01) return "< 0.01 g";
  var digits = n >= 100 ? 1 : n >= 10 ? 2 : 3;
  var text = n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  if (text === "0" && n > 0) return "< 0.01 g";
  return text + " g";
}

window.SSG_CROPS = {"radish": {"name": "Radish", "source": "Utah State University Extension, 42 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days. Mississippi State University Extension gives a volume example of 2 to 3 tablespoons of radish seed per 10 by 20 inch tray, which is a different way of measuring the same job.", "grams": 42}, "pea": {"name": "Pea", "source": "Utah State University Extension, 150 g per 1020 tray.", "note": "Utah State presoaks pea seed about 6 hours. University of Maryland Extension lists pea among seeds often soaked 6 to 12 hours. Covered about 3 days. Harvest about 8 to 10 days.", "grams": 150}, "sunflower": {"name": "Sunflower", "source": "Utah State University Extension, 48 g per 1020 tray.", "note": "Utah State presoaks sunflower about 12 hours. Covered about 3 days. Harvest about 9 to 10 days. Penn State Extension recommends weight on sunflower seed during germination so hulls release from the cotyledons.", "grams": 48}, "broccoli": {"name": "Broccoli", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 2 to 4 days. Harvest about 8 to 12 days.", "grams": 28}, "kale": {"name": "Kale", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "arugula": {"name": "Arugula", "source": "Utah State University Extension, 10 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 6 to 8 days.", "grams": 10}, "cilantro": {"name": "Cilantro", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "Utah State lists no presoak. University of Maryland Extension includes cilantro among seeds that may be soaked 6 to 12 hours. Covered about 7 to 14 days. Harvest about 21 to 28 days.", "grams": 28}, "basil": {"name": "Basil", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 4 to 7 days. Harvest about 12 to 16 days.", "grams": 28}, "rutabaga": {"name": "Rutabaga", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "mustard": {"name": "Mustard", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g (about 1 tablespoon) per 10 by 20 inch flat. It is not a mustard-only weighed rate.", "note": "Mustard is a small brassica seed. Mississippi State University Extension groups mustard with crops often ready about 10 to 15 days after sowing. Treat 10 to 15 g as a starting band for a nominal 10 by 20 inch flat, then adjust the next tray.", "needsRate": true}, "beet": {"name": "Beet", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Beet is listed in that publication's seed-count examples, not as its own weighed tray rate.", "note": "University of Maryland Extension lists beet among seeds that may be soaked 6 to 12 hours. Illinois Extension groups beet with slower-to-germinate choices. Mississippi State University Extension groups beets at about 16 to 25 days.", "needsRate": true}, "amaranth": {"name": "Amaranth", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Amaranth is named as a suitable crop there, not given its own gram rate.", "note": "Illinois Extension groups amaranth with slower-to-germinate choices. Mississippi State University Extension groups red amaranth at about 16 to 25 days. The 10 to 15 g band is a general small-seed starting point, not an amaranth trial result.", "needsRate": true}};
(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var out = document.getElementById("calc-results");
  var summary = document.getElementById("calc-summary");
  var customBox = document.getElementById("custom-dims");
  var rateBox = document.getElementById("rate-box");
  var unitPriceBox = document.getElementById("unit-price-fields");
  var packagePriceBox = document.getElementById("package-price-fields");
  var copyBtn = document.getElementById("copy-result");
  var shareBtn = document.getElementById("copy-link");
  var printBtn = document.getElementById("print-result");
  var actionStatus = document.getElementById("calc-action-status");
  var copyFallback = document.getElementById("calc-copy-fallback");
  if (!form || !out || !summary || typeof ssgCompute !== "function") return;

  var CROPS = window.SSG_CROPS || {};
  var lastResult = null;
  var lastState = null;

  function selectedTray() {
    var picked = form.querySelector('input[name="tray"]:checked');
    return picked ? picked.value : "10x20";
  }

  function setHidden(box, hidden) {
    if (!box) return;
    box.hidden = hidden;
    var inputs = box.querySelectorAll("input, select, button");
    for (var i = 0; i < inputs.length; i++) inputs[i].disabled = hidden;
  }

  function crop() {
    return CROPS[form.crop.value] || {};
  }

  function readState() {
    return {
      tray: selectedTray(),
      length: form.sideLength.value,
      width: form.sideWidth.value,
      unit: form.unit.value,
      trays: form.trays.value,
      crop: crop(),
      useExample: form.useExample.value === "1",
      userLow: form.userLow.value,
      userHigh: form.userHigh.value,
      priceMode: form.priceMode.value,
      price: form.price.value,
      priceUnit: form.priceUnit.value,
      packagePrice: form.packagePrice.value,
      packageGrams: form.packageGrams.value
    };
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function evidenceLabel(result) {
    return result.evidence === "crop-rate"
      ? "Published crop rate"
      : result.evidence === "general-example"
        ? "General example, not a crop-specific rate"
        : "Your rate, not a published crop rate";
  }

  function pair(low, high, formatter) {
    if (Math.abs(low - high) < 1e-9) return formatter(low);
    return formatter(low) + " to " + formatter(high);
  }

  function scenarioBlock(label, scene) {
    return (
      "<h3>" + label + "</h3>" +
      "<p class='stat'>Dry seed for this batch: <strong>" + ssgFormatGrams(scene.needed) + "</strong></p>" +
      "<p class='stat'>Complete trays one package can fill at this rate: <strong>" + scene.completeTrays + "</strong></p>" +
      "<p class='stat'>Packages to buy for this batch: <strong>" + scene.packages + "</strong></p>" +
      "<p class='stat'>Seed left after this batch: <strong>" + ssgFormatGrams(scene.leftover) + "</strong></p>" +
      "<p class='stat'>Consumed seed cost: <strong>" + money(scene.consumed) + "</strong></p>" +
      "<p class='stat'>Checkout spend for whole packages: <strong>" + money(scene.checkout) + "</strong></p>"
    );
  }

  function render(result) {
    [copyBtn, shareBtn, printBtn].forEach(function (button) {
      if (button) button.disabled = !result.ok;
    });
    if (!result.ok) {
      summary.textContent = result.error;
      out.innerHTML = '<p class="eyebrow">Your seed estimate</p><h2>Check your inputs</h2><p class="error">' + escapeHtml(result.error) + "</p>";
      return;
    }
    var weight = pair(result.perLow, result.perHigh, ssgFormatGrams);
    var ounces = pair(result.perLow / SSG_G_PER_OZ, result.perHigh / SSG_G_PER_OZ, function (n) {
      if (n > 0 && n < 0.01) return "< 0.01 oz";
      return n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " oz";
    });
    var total = pair(result.totalLow, result.totalHigh, ssgFormatGrams);
    var evidence = evidenceLabel(result);
    summary.textContent = crop().name + ": seed per tray " + weight + ". Total " + total + ". " + evidence + ".";

    var costHtml = "<p>Leave the price blank if you only want weight.</p>";
    if (result.cost.kind === "unit") {
      var unitName = result.cost.priceUnit === "lb" ? "pound" : result.cost.priceUnit === "oz" ? "ounce" : "kilogram";
      costHtml =
        "<p class='stat'>Approximate seed cost per tray: <strong>" + pair(result.cost.perLow, result.cost.perHigh, money) + "</strong></p>" +
        "<p class='stat'>Approximate seed cost for " + result.trays + " tray" + (result.trays === 1 ? "" : "s") + ": <strong>" + pair(result.cost.totalLow, result.cost.totalHigh, money) + "</strong></p>" +
        "<p>This is consumed seed cost at your price per " + unitName + ". It is not the cash to buy a whole bag, and it leaves out trays, mix, and a lamp.</p>";
    } else if (result.cost.kind === "package") {
      var same = Math.abs(result.perLow - result.perHigh) < 1e-9;
      costHtml = "<p>Package math uses your bag price and bag weight. Consumed cost is the seed this batch uses. Checkout spend is the whole packages you would buy. Leftover amounts are for that scenario only, not a minimum and maximum of all possible leftovers.</p>";
      costHtml += scenarioBlock(same ? "This rate" : "Lower rate scenario", result.cost.low);
      if (!same) costHtml += scenarioBlock("Higher rate scenario", result.cost.high);
    }

    var seedLinks = {
      radish: ["https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fradish-rambo-seeds", "See radish seed"],
      pea: ["https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fdun-pea-seeds", "See pea seed"]
    };
    var seedOffer = seedLinks[form.crop.value] || ["https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fmicro-greens-planting-seed", "Browse microgreen seeds"];
    out.innerHTML =
      "<p class='eyebrow'>Your seed estimate</p><h2>" + escapeHtml(crop().name) + "</h2>" +
      "<div class='result-metrics'><div class='result-metric'><span>Dry seed per tray</span><strong>" + escapeHtml(weight) + "</strong><span>" + escapeHtml(ounces) + "</span></div>" +
      "<div class='result-metric'><span>For " + result.trays + " tray" + (result.trays === 1 ? "" : "s") + "</span><strong>" + escapeHtml(total) + "</strong><span>Total dry seed</span></div></div>" +
      "<p class='result-evidence'>" + escapeHtml(evidence) + "</p>" +
      "<div class='result-cost'><h3>Seed-only cost</h3>" + costHtml + "</div>" +
      "<p class='result-area'>" + escapeHtml(result.areaLabel) + "</p>" +
      "<details class='result-method'><summary>Rate and assumptions</summary><p>" + escapeHtml(result.rateNote) + "</p>" +
      "<p>Seed weight scales by tray area. Nominal outer dimensions may differ from the inner growing floor. This estimate does not adjust for germination or predict yield.</p>" +
      (crop().note ? "<p>" + escapeHtml(crop().note) + "</p>" : "") + "</details>" +
      "<p class='result-seed'><a href='" + seedOffer[0] + "' rel='sponsored nofollow' target='_blank'>" + seedOffer[1] + "</a></p>" +
      "<div class='cta-row result-next-actions'><a class='button' href='/gear/?setup=tray#seeds'>Build my supply list</a><a href='/guides/microgreens-kit-vs-diy-cost/#cost-comparison'>Compare setup costs</a></div>" +
      "<p class='next-action'><a href='/guides/microgreens-seed-density-per-tray/'>How these rates were chosen</a></p>";
  }

  function shareParams() {
    var params = new URLSearchParams();
    params.set("crop", form.crop.value);
    params.set("tray", selectedTray());
    params.set("n", form.trays.value);
    if (selectedTray() === "custom") {
      params.set("l", form.sideLength.value);
      params.set("w", form.sideWidth.value);
      params.set("unit", form.unit.value);
    }
    if (crop().needsRate && form.useExample.value === "1") {
      params.set("example", "1");
    } else if (crop().needsRate) {
      if (form.userLow.value) params.set("rate", form.userLow.value);
      if (form.userHigh.value) params.set("rateHigh", form.userHigh.value);
    }
    return params;
  }

  function syncShare() {
    var params = new URLSearchParams(window.location.search);
    // Replace calculator state while preserving campaign tags and other page context.
    ["crop", "tray", "n", "l", "w", "unit", "example", "rate", "rateHigh",
      "price", "priceUnit", "priceMode", "packagePrice", "packageGrams"].forEach(function (key) {
      params.delete(key);
    });
    shareParams().forEach(function (value, key) { params.set(key, value); });
    var next = window.location.pathname + "?" + params.toString() + window.location.hash;
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", next);
  }

  function calculate() {
    setHidden(customBox, selectedTray() !== "custom");
    setHidden(rateBox, !crop().needsRate);
    setHidden(unitPriceBox, form.priceMode.value !== "unit");
    setHidden(packagePriceBox, form.priceMode.value !== "package");
    form.sideLength.max = form.sideWidth.max = form.unit.value === "cm" ? "120" : "48";
    if (actionStatus) actionStatus.hidden = true;
    if (copyFallback) copyFallback.hidden = true;
    lastState = readState();
    lastResult = ssgCompute(lastState);
    render(lastResult);
    if (lastResult.ok) syncShare();
    return lastResult;
  }

  function applyQuery() {
    var q = new URLSearchParams(window.location.search);
    if (q.get("crop") && Object.prototype.hasOwnProperty.call(CROPS, q.get("crop"))) form.crop.value = q.get("crop");
    var tray = q.get("tray");
    if (["10x20", "10x10", "5x5", "custom"].indexOf(tray) !== -1) {
      var radio = form.querySelector('input[name="tray"][value="' + tray + '"]');
      if (radio) radio.checked = true;
    }
    if (q.get("l")) form.sideLength.value = q.get("l");
    if (q.get("w")) form.sideWidth.value = q.get("w");
    if (q.get("unit") === "cm" || q.get("unit") === "in") form.unit.value = q.get("unit");
    if (q.get("n")) form.trays.value = q.get("n");
    if (q.get("example") === "1") {
      form.useExample.value = "1";
      form.userLow.value = "10";
      form.userHigh.value = "15";
    } else {
      if (q.get("rate")) form.userLow.value = q.get("rate");
      if (q.get("rateHigh")) form.userHigh.value = q.get("rateHigh");
    }
  }

  function handleEdit(event) {
    if (event.target === form.userLow || event.target === form.userHigh) form.useExample.value = "0";
    calculate();
  }

  form.addEventListener("input", handleEdit);
  form.addEventListener("change", handleEdit);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var result = calculate();
    out.focus({ preventScroll: true });
    if (out.scrollIntoView) {
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      out.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    if (result.ok && typeof gtag === "function") {
      gtag("event", "calculator_result");
    }
  });
  var exampleBtn = document.getElementById("use-example");
  if (exampleBtn) {
    exampleBtn.addEventListener("click", function () {
      form.useExample.value = "1";
      form.userLow.value = "10";
      form.userHigh.value = "15";
      calculate();
    });
  }
  var clearRate = document.getElementById("clear-example");
  if (clearRate) {
    clearRate.addEventListener("click", function () {
      form.useExample.value = "0";
      form.userLow.value = "";
      form.userHigh.value = "";
      calculate();
    });
  }
  function resultText() {
    var result = lastResult;
    var lines = [
      "Small Space Greens | Seed estimate",
      "Crop: " + lastState.crop.name,
      "Tray: " + result.areaLabel,
      "Number of trays: " + result.trays,
      "Dry seed per tray: " + pair(result.perLow, result.perHigh, ssgFormatGrams),
      "Total dry seed: " + pair(result.totalLow, result.totalHigh, ssgFormatGrams)
    ];
    if (result.cost.kind === "unit") {
      lines.push("Seed price: " + money(Number(lastState.price)) + " per " + result.cost.priceUnit);
      lines.push("Consumed seed cost per tray: " + pair(result.cost.perLow, result.cost.perHigh, money));
      lines.push("Consumed seed cost for this batch: " + pair(result.cost.totalLow, result.cost.totalHigh, money));
    } else if (result.cost.kind === "package") {
      lines.push("Package: " + ssgFormatGrams(result.cost.packGrams) + " at " + money(result.cost.price));
      [result.cost.low, result.cost.high].forEach(function (scene, index) {
        if (index === 1 && result.perLow === result.perHigh) return;
        if (result.perLow !== result.perHigh) lines.push(index === 0 ? "Lower-rate scenario:" : "Higher-rate scenario:");
        lines.push("Complete trays per package: " + scene.completeTrays);
        lines.push("Packages to buy: " + scene.packages + "; seed left after batch: " + ssgFormatGrams(scene.leftover));
        lines.push("Consumed seed cost: " + money(scene.consumed) + "; checkout spend: " + money(scene.checkout));
      });
      if (result.perLow !== result.perHigh) lines.push("Leftover amounts describe these scenarios, not a minimum/maximum range.");
    }
    lines.push("Evidence: " + evidenceLabel(result) + ". " + result.rateNote);
    lines.push("Seed cost only. Excludes trays, growing medium, water and lighting. Area scaling does not adjust for germination or predict yield.");
    lines.push("Rates and sources: https://smallspacegreens.com/tools/microgreens-seed-calculator/");
    return lines.join("\n");
  }

  async function copyText(text, successMessage) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      if (actionStatus) {
        actionStatus.textContent = successMessage;
        actionStatus.hidden = false;
      }
    } catch (error) {
      if (copyFallback) {
        copyFallback.value = text;
        copyFallback.hidden = false;
        copyFallback.focus();
        copyFallback.select();
      }
      if (actionStatus) {
        actionStatus.textContent = "Automatic copying is unavailable. Select and copy the text below.";
        actionStatus.hidden = false;
      }
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (lastResult && lastResult.ok) return copyText(resultText(), "Seed estimate copied, including your cost inputs.");
    });
  }
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (lastResult && lastResult.ok) {
        var url = window.location.origin + window.location.pathname + "?" + shareParams().toString();
        return copyText(url, "Link copied. Tray settings and rates are included; prices are excluded.");
      }
    });
  }
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      if (lastResult && lastResult.ok) window.print();
    });
  }
  var resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.useExample.value = "0";
      calculate();
    });
  }
  applyQuery();
  calculate();
})();
