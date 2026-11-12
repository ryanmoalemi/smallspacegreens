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
        ? "General Maryland rate, not a crop-specific rate"
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
    [copyBtn, printBtn].forEach(function (button) {
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
      packageHtml(result, seedOffer) +
      "<div class='cta-row result-next-actions'><a class='button' href='" + supplyListHref() + "'>Build my supply list</a><a href='/guides/microgreens-kit-vs-diy-cost/#cost-comparison'>Compare setup costs</a></div>" +
      "<p class='next-action'><a href='/guides/microgreens-seed-density-per-tray/'>How these rates were chosen</a></p>";
  }

  function gramsLabel(n) {
    return "about " + Math.round(n).toLocaleString("en-US") + " g";
  }

  // Which listed size covers this batch, shown before the click. True Leaf first; a matching
  // Amazon offer only when the True Leaf size is out of stock at the last check.
  function packagePhoto(packs, choice) {
    var embed = choice.merchant === "amazon" ? choice.size.imageEmbed : null;
    if (embed) {
      // Amazon-served product image, never rehosted. Set per offer in trueleaf-packages.json (image_embed).
      return "<figure class='result-pack-photo'><img src='" + escapeHtml(embed) + "' alt='" + escapeHtml(choice.size.title) + "' width='96' height='96' loading='lazy' decoding='async'></figure>";
    }
    var photo = packs.photo;
    if (!photo) return "";
    return "<figure class='result-pack-photo'><img src='" + escapeHtml(photo.src) + "' alt='" + escapeHtml(photo.alt) + "' width='96' height='96' loading='lazy' decoding='async'></figure>";
  }

  function packageCredit(packs, choice) {
    var photo = packs.photo;
    if (!photo || (choice.merchant === "amazon" && choice.size.imageEmbed)) return "";
    var license = photo.license ? ", " + photo.license : "";
    return (
      "<p class='photo-credit credit-line result-pack-credit' title='" + escapeHtml("Photo by " + photo.author + license + ". Full credit on the Photo credits page.") + "'>" +
      "Photo: <a href='" + escapeHtml(photo.credit) + "'>" + escapeHtml(photo.author) + "</a></p>"
    );
  }

  function rateUsed(result, perTray) {
    if (!crop().needsRate) return "";
    var which = result.evidence === "general-example"
      ? "Sized with the Maryland setup rate, using its upper end of " + perTray + " per tray."
      : Math.abs(result.perLow - result.perHigh) < 1e-9
        ? "Sized with your rate, " + perTray + " per tray."
        : "Sized with the upper end of your rate, " + perTray + " per tray.";
    return "<p class='result-pack-rate'>" + escapeHtml(which) + "</p>";
  }

  function packageHtml(result, seedOffer) {
    var fallback = "<p class='result-seed'><a href='" + seedOffer[0] + "' rel='sponsored nofollow' target='_blank'>" + seedOffer[1] + "</a></p>";
    var packs = (window.SSG_PACKS || {})[form.crop.value];
    if (!packs || typeof ssgPickPackage !== "function") return fallback;
    var choice = ssgPickPackage(packs.sizes, result.perHigh, result.totalHigh, packs.amazon);
    if (!choice) return fallback;
    var size = choice.size;
    var amazon = choice.merchant === "amazon";
    var perTray = ssgFormatGrams(result.perHigh);
    var line = size.unit === "g" ? size.label : size.label + " (" + gramsLabel(size.grams) + ")";
    var largest = amazon ? packs.amazon[packs.amazon.length - 1] : packs.sizes[packs.sizes.length - 1];
    var bags = choice.sowings === 1 ? "" : "s";
    var cover = choice.coversBatch
      ? "At " + perTray + " per tray, that is about " + choice.sowings + " sowing" + bags + "."
      : (size === largest ? "The largest listed size. " : "") + "At " + perTray + " per tray, that is about " + choice.sowings + " sowing" + bags + ", so this batch needs more than one bag.";
    // No packet sentence on Amazon picks or on radish (Ryan, Nov 10, 2026).
    var short = choice.smallerShort.length && !amazon && form.crop.value !== "radish"
      ? " The True Leaf " + choice.smallerShort.map(function (s) { return s.label; }).join(" and ") + " is less than one tray at this rate."
      : "";
    var sizes = packs.sizes.map(function (s) { return s.label; }).join(", ");
    var product = amazon
      ? "<p class='result-pack-product'>" + escapeHtml(size.title) + "</p>"
      : "<p class='result-pack-product'>" + escapeHtml(packs.product) + ", True Leaf Market</p>";
    var action = amazon
      ? "<p class='result-pack-link'><a href='" + escapeHtml(size.url) + "' rel='sponsored nofollow' target='_blank'>View on Amazon</a></p>"
      : "<p class='result-pack-link'><a href='" + escapeHtml(size.url) + "' rel='sponsored nofollow' target='_blank'>See " + escapeHtml(packs.product) + ", " + escapeHtml(size.label) + "</a></p>";
    var fine = amazon
      ? "True Leaf's " + choice.replaced.label + " was sold out on " + packs.stockDate + ". Check size and stock on Amazon."
      : "True Leaf lists " + sizes + ". This opens with " + size.label + " selected. Check the size and stock on the seller page.";
    return (
      "<div class='result-pack'>" + packagePhoto(packs, choice) + "<div class='result-pack-body'><p class='result-pack-label'>Package to consider</p>" +
      "<p class='result-pack-size'><strong>" + escapeHtml(line) + "</strong></p>" + product +
      rateUsed(result, perTray) +
      "<p class='result-pack-note'>" + escapeHtml(cover + short) + "</p>" +
      action +
      "<p class='result-pack-sizes'>" + escapeHtml(fine) + "</p></div>" + packageCredit(packs, choice) + "</div>"
    );
  }


  function supplyListHref() {
    var params = shareParams();
    params.set("setup", "tray");
    if (selectedTray() === "custom") params.set("basis", "custom");
    else params.set("basis", "nominal");
    ["price", "priceUnit", "priceMode", "packagePrice", "packageGrams"].forEach(function (key) {
      params.delete(key);
    });
    return "/gear/?" + params.toString() + "#setup-list";
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
