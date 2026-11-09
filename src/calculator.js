(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var out = document.getElementById("calc-results");
  var summary = document.getElementById("calc-summary");
  var customBox = document.getElementById("custom-dims");
  var rateBox = document.getElementById("rate-box");
  if (!form || !out || typeof ssgCompute !== "function") return;

  var CROPS = window.SSG_CROPS || {};

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
      "<p class='stat'>Seed left in the last package: <strong>" + ssgFormatGrams(scene.leftover) + "</strong></p>" +
      "<p class='stat'>Consumed seed cost: <strong>" + money(scene.consumed) + "</strong></p>" +
      "<p class='stat'>Checkout spend for whole packages: <strong>" + money(scene.checkout) + "</strong></p>"
    );
  }

  function render(result) {
    if (!result.ok) {
      summary.textContent = result.error;
      out.innerHTML = '<p class="error">' + result.error + "</p>";
      return;
    }
    var weight = pair(result.perLow, result.perHigh, ssgFormatGrams);
    var ounces = pair(result.perLow / SSG_G_PER_OZ, result.perHigh / SSG_G_PER_OZ, function (n) {
      if (n > 0 && n < 0.01) return "< 0.01 oz";
      return n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " oz";
    });
    var total = pair(result.totalLow, result.totalHigh, ssgFormatGrams);
    var evidence = result.evidence === "crop-rate"
      ? "Crop-specific published rate."
      : result.evidence === "general-example"
        ? "General example you chose, not a crop-specific rate."
        : "Rate you typed. Not a published crop rate.";
    summary.textContent = "Seed per tray " + weight + ". Total " + total + ". " + evidence;

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
      "<h2>Result</h2>" +
      "<p class='stat'>1. Dry seed per tray: <strong>" + weight + "</strong> (" + ounces + ")</p>" +
      "<p class='stat'>2. Dry seed for " + result.trays + " tray" + (result.trays === 1 ? "" : "s") + ": <strong>" + total + "</strong></p>" +
      "<p class='stat'>3. Seed-only cost</p>" + costHtml +
      "<p class='stat'>4. Evidence: <strong>" + evidence + "</strong></p>" +
      "<p>Tray area used: " + result.areaLabel + ". Nominal outer size is not the inner growing floor.</p>" +
      "<p>5. Notes. " + result.rateNote + "</p>" +
      "<p class='next-action'><a href='/guides/microgreens-seed-density-per-tray/'>Read how the rates were chosen</a> or <a href='/guides/microgreens-kit-vs-diy-cost/'>compare setup costs</a>.</p>";
  }

  function syncShare() {
    var params = new URLSearchParams();
    params.set("crop", form.crop.value);
    params.set("tray", selectedTray());
    params.set("n", form.trays.value);
    if (selectedTray() === "custom") {
      params.set("l", form.sideLength.value);
      params.set("w", form.sideWidth.value);
      params.set("unit", form.unit.value);
    }
    if (crop().needsRate && form.useExample.value === "1") params.set("example", "1");
    if (crop().needsRate && form.userLow.value) params.set("rate", form.userLow.value);
    if (crop().needsRate && form.userHigh.value) params.set("rateHigh", form.userHigh.value);
    var next = window.location.pathname + "?" + params.toString();
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", next);
  }

  function calculate() {
    setHidden(customBox, selectedTray() !== "custom");
    setHidden(rateBox, !crop().needsRate);
    var result = ssgCompute(readState());
    render(result);
    if (result.ok) syncShare();
  }

  function applyQuery() {
    var q = new URLSearchParams(window.location.search);
    if (q.get("crop") && CROPS[q.get("crop")]) form.crop.value = q.get("crop");
    var tray = q.get("tray");
    if (tray) {
      var radio = form.querySelector('input[name="tray"][value="' + tray + '"]');
      if (radio) radio.checked = true;
    }
    if (q.get("l")) form.sideLength.value = q.get("l");
    if (q.get("w")) form.sideWidth.value = q.get("w");
    if (q.get("unit") === "cm" || q.get("unit") === "in") form.unit.value = q.get("unit");
    if (q.get("n")) form.trays.value = q.get("n");
    if (q.get("example") === "1") form.useExample.value = "1";
    if (q.get("rate")) form.userLow.value = q.get("rate");
    if (q.get("rateHigh")) form.userHigh.value = q.get("rateHigh");
  }

  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculate();
    summary.focus();
    if (!out.querySelector(".error") && typeof gtag === "function") {
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
  var copyBtn = document.getElementById("copy-result");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = summary.textContent || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    });
  }
  var resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.useExample.value = "0";
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", window.location.pathname);
      calculate();
    });
  }
  applyQuery();
  calculate();
})();
