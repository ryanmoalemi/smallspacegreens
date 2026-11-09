(function () {
  "use strict";

  var REF_AREA = 200;
  var G_PER_OZ = 28.349523125;
  var G_PER_LB = 453.59237;
  var CROPS = window.SSG_CROPS;

  var form = document.getElementById("calc-form");
  var out = document.getElementById("calc-results");
  var customBox = document.getElementById("custom-dims");
  if (!form || !out) return;

  function selectedTray() {
    var picked = form.querySelector('input[name="tray"]:checked');
    return picked ? picked.value : "10x20";
  }

  function toggleCustom() {
    var custom = selectedTray() === "custom";
    customBox.hidden = !custom;
    var inputs = customBox.querySelectorAll("input, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = !custom;
    }
  }

  function areaSqIn() {
    var tray = selectedTray();
    if (tray === "10x20") return { area: 200, label: "10 by 20 inches (200 square inches, nominal)" };
    if (tray === "10x10") return { area: 100, label: "10 by 10 inches (100 square inches, nominal)" };
    if (tray === "5x5") return { area: 25, label: "5 by 5 inches (25 square inches, nominal)" };
    var length = Number(form.sideLength.value);
    var width = Number(form.sideWidth.value);
    var unit = form.unit.value;
    if (!(length > 0) || !(width > 0)) return { error: "Enter a length and width greater than zero." };
    var lIn = unit === "cm" ? length / 2.54 : length;
    var wIn = unit === "cm" ? width / 2.54 : width;
    var area = lIn * wIn;
    var unitLabel = unit === "cm" ? "cm" : "inches";
    return {
      area: area,
      label: length + " by " + width + " " + unitLabel + " (" + formatNum(area, 1) + " square inches)"
    };
  }

  function formatNum(n, digits) {
    return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  function formatG(n) {
    return formatNum(n, n >= 100 ? 0 : 2) + " g";
  }

  function formatOz(n) {
    return formatNum(n, 2) + " oz";
  }

  function formatMoney(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pair(low, high, formatter) {
    if (Math.abs(low - high) < 0.000001) return formatter(low);
    return formatter(low) + " to " + formatter(high);
  }

  function costForGrams(grams, price, priceUnit) {
    if (priceUnit === "lb") return (grams / G_PER_LB) * price;
    if (priceUnit === "oz") return (grams / G_PER_OZ) * price;
    return (grams / 1000) * price;
  }

  function calculate() {
    toggleCustom();
    var crop = CROPS[form.crop.value];
    var areaInfo = areaSqIn();
    var trays = Number(form.trays.value);
    if (areaInfo.error) {
      out.innerHTML = '<p class="error">' + areaInfo.error + "</p>";
      return;
    }
    if (!(trays >= 1) || Math.floor(trays) !== trays) {
      out.innerHTML = '<p class="error">Enter a whole number of trays, at least 1.</p>';
      return;
    }
    var factor = areaInfo.area / REF_AREA;
    var low = (crop.grams != null ? crop.grams : crop.low) * factor;
    var high = (crop.grams != null ? crop.grams : crop.high) * factor;
    var totalLow = low * trays;
    var totalHigh = high * trays;
    var priceRaw = form.price.value.trim();
    var costHtml = "<p>Add a seed price if you want an approximate seed cost. Leave it blank to skip cost.</p>";
    if (priceRaw !== "") {
      var price = Number(priceRaw);
      if (!(price >= 0)) {
        out.innerHTML = '<p class="error">Seed price should be zero or a positive number.</p>';
        return;
      }
      var unit = form.priceUnit.value;
      var unitName = unit === "lb" ? "pound" : unit === "oz" ? "ounce" : "kilogram";
      var perLow = costForGrams(low, price, unit);
      var perHigh = costForGrams(high, price, unit);
      var allLow = costForGrams(totalLow, price, unit);
      var allHigh = costForGrams(totalHigh, price, unit);
      costHtml =
        "<p class='stat'>Approximate seed cost per tray: <strong>" + pair(perLow, perHigh, formatMoney) + "</strong></p>" +
        "<p class='stat'>Approximate seed cost for " + trays + " tray" + (trays === 1 ? "" : "s") + ": <strong>" + pair(allLow, allHigh, formatMoney) + "</strong></p>" +
        "<p>Cost uses only the seed weight and your price per " + unitName + ". It does not include trays, mix, water, or a lamp.</p>";
    }
    out.innerHTML =
      "<h2>Result</h2>" +
      "<p class='stat'>Tray area used: <strong>" + areaInfo.label + "</strong></p>" +
      "<p class='stat'>Seed per tray: <strong>" + pair(low, high, formatG) + "</strong> (" + pair(low / G_PER_OZ, high / G_PER_OZ, formatOz) + ")</p>" +
      "<p class='stat'>Seed for " + trays + " tray" + (trays === 1 ? "" : "s") + ": <strong>" + pair(totalLow, totalHigh, formatG) + "</strong> (" + pair(totalLow / G_PER_OZ, totalHigh / G_PER_OZ, formatOz) + ")</p>" +
      costHtml +
      "<p><strong>Rate used.</strong> " + crop.source + "</p>" +
      "<p>" + crop.note + "</p>";
  }

  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculate();
    out.focus();
  });
  toggleCustom();
  calculate();
})();
