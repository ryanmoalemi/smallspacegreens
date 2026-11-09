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
