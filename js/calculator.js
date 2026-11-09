window.SSG_CROPS = {"radish": {"name": "Radish", "source": "Utah State University Extension, 42 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days. Mississippi State University Extension gives a volume example of 2 to 3 tablespoons of radish seed per 10 by 20 inch tray, which is a different way of measuring the same job.", "grams": 42}, "pea": {"name": "Pea", "source": "Utah State University Extension, 150 g per 1020 tray.", "note": "Utah State presoaks pea seed about 6 hours. University of Maryland Extension lists pea among seeds often soaked 6 to 12 hours. Covered about 3 days. Harvest about 8 to 10 days.", "grams": 150}, "sunflower": {"name": "Sunflower", "source": "Utah State University Extension, 48 g per 1020 tray.", "note": "Utah State presoaks sunflower about 12 hours. Covered about 3 days. Harvest about 9 to 10 days. Penn State Extension recommends weight on sunflower seed during germination so hulls release from the cotyledons.", "grams": 48}, "broccoli": {"name": "Broccoli", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 2 to 4 days. Harvest about 8 to 12 days.", "grams": 28}, "kale": {"name": "Kale", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "arugula": {"name": "Arugula", "source": "Utah State University Extension, 10 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 6 to 8 days.", "grams": 10}, "cilantro": {"name": "Cilantro", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "Utah State lists no presoak. University of Maryland Extension includes cilantro among seeds that may be soaked 6 to 12 hours. Covered about 7 to 14 days. Harvest about 21 to 28 days.", "grams": 28}, "basil": {"name": "Basil", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 4 to 7 days. Harvest about 12 to 16 days.", "grams": 28}, "rutabaga": {"name": "Rutabaga", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "mustard": {"name": "Mustard", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g (about 1 tablespoon) per 10 by 20 inch flat. It is not a mustard-only weighed rate.", "note": "Mustard is a small brassica seed. Mississippi State University Extension groups mustard with crops often ready about 10 to 15 days after sowing. Treat 10 to 15 g as a starting band for a nominal 10 by 20 inch flat, then adjust the next tray.", "low": 10, "high": 15}, "beet": {"name": "Beet", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Beet is listed in that publication's seed-count examples, not as its own weighed tray rate.", "note": "University of Maryland Extension lists beet among seeds that may be soaked 6 to 12 hours. Illinois Extension groups beet with slower-to-germinate choices. Mississippi State University Extension groups beets at about 16 to 25 days.", "low": 10, "high": 15}, "amaranth": {"name": "Amaranth", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Amaranth is named as a suitable crop there, not given its own gram rate.", "note": "Illinois Extension groups amaranth with slower-to-germinate choices. Mississippi State University Extension groups red amaranth at about 16 to 25 days. The 10 to 15 g band is a general small-seed starting point, not an amaranth trial result.", "low": 10, "high": 15}};
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
