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

// Smallest listed package that covers several sowings (SSG_MIN_SOWINGS) and the whole batch
// at the higher rate. Falls back to the smallest that covers the batch, then to the largest.
// sizes: [{label, grams, ...}] sorted small to large. Returns null when nothing is listed.
var SSG_MIN_SOWINGS = 3;
function ssgPickPackage(sizes, perTray, batch) {
  if (!sizes || !sizes.length || !ssgFinite(perTray) || perTray <= 0) return null;
  function smallestAtLeast(grams) {
    for (var i = 0; i < sizes.length; i++) if (sizes[i].grams >= grams) return sizes[i];
    return null;
  }
  var pick = smallestAtLeast(Math.max(batch, perTray * SSG_MIN_SOWINGS)) || smallestAtLeast(batch);
  var covers = Boolean(pick);
  if (!pick) pick = sizes[sizes.length - 1];
  var smaller = [];
  for (var j = 0; j < sizes.length && sizes[j] !== pick; j++) smaller.push(sizes[j]);
  return {
    size: pick,
    sowings: Math.floor(pick.grams / perTray + 1e-9),
    coversBatch: covers,
    smallerShort: smaller.filter(function (s) { return s.grams < perTray; })
  };
}
