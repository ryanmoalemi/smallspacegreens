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
        error: "This crop has no crop-specific gram rate in the Utah State table. Enter your own grams per 10 by 20 inch tray, or choose the labeled Maryland setup."
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
function ssgPickPackage(sizes, perTray, batch, amazon) {
  if (!sizes || !sizes.length || !ssgFinite(perTray) || perTray <= 0) return null;
  function smallestAtLeast(grams) {
    for (var i = 0; i < sizes.length; i++) if (sizes[i].grams >= grams) return sizes[i];
    return null;
  }
  var wanted = smallestAtLeast(Math.max(batch, perTray * SSG_MIN_SOWINGS)) || smallestAtLeast(batch) || sizes[sizes.length - 1];
  var pick = wanted;
  var merchant = "trueleaf";
  // Never recommend a size marked out of stock at the last True Leaf check.
  // First choice: an in-stock Amazon offer of the closest quantity to that size.
  // Otherwise fall back to the next smaller in-stock True Leaf size, else the next larger one.
  if (pick.inStock === false) {
    var best = null;
    (amazon || []).forEach(function (offer) {
      if (offer.inStock === false || !(offer.grams > 0)) return;
      var gap = Math.abs(Math.log(offer.grams / wanted.grams));
      if (!best || gap < best.gap - 1e-9 || (Math.abs(gap - best.gap) < 1e-9 && offer.grams > best.offer.grams)) best = { offer: offer, gap: gap };
    });
    if (best) {
      pick = best.offer;
      merchant = "amazon";
    } else {
      var at = sizes.indexOf(pick);
      var alt = null;
      for (var k = at - 1; k >= 0 && !alt; k--) if (sizes[k].inStock !== false) alt = sizes[k];
      for (var m = at + 1; m < sizes.length && !alt; m++) if (sizes[m].inStock !== false) alt = sizes[m];
      if (!alt) return null;
      pick = alt;
    }
  }
  var covers = pick.grams >= batch;
  var smaller = [];
  var stopAt = merchant === "amazon" ? wanted : pick;
  for (var j = 0; j < sizes.length && sizes[j] !== stopAt; j++) smaller.push(sizes[j]);
  return {
    size: pick,
    merchant: merchant,
    replaced: merchant === "amazon" ? wanted : null,
    sowings: Math.floor(pick.grams / perTray + 1e-9),
    coversBatch: covers,
    smallerShort: smaller.filter(function (s) { return s.grams < perTray; })
  };
}

/* Pure supply-handoff helpers. No DOM. Seed math stays in calc-core.js. */
var SSG_GROW_KEYS = ["setup", "crop", "tray", "n", "l", "w", "unit", "example", "rate", "rateHigh", "basis"];
var SSG_PRICE_KEYS = ["price", "priceUnit", "priceMode", "packagePrice", "packageGrams"];

function ssgParseGrow(search) {
  var q = (typeof search === "string")
    ? new URLSearchParams(search[0] === "?" ? search.slice(1) : search)
    : (search || new URLSearchParams());
  var grow = { ok: false };
  var setup = q.get("setup");
  if (setup === "kit" || setup === "tray" || setup === "reuse") grow.setup = setup;
  var crop = q.get("crop");
  if (crop) grow.crop = crop;
  var tray = q.get("tray");
  if (tray === "10x20" || tray === "10x10" || tray === "5x5" || tray === "custom") grow.tray = tray;
  var n = q.get("n");
  if (n != null && n !== "") {
    var trays = Number(n);
    if (Number.isFinite(trays) && trays >= 1 && Math.floor(trays) === trays) grow.trays = trays;
  }
  if (q.get("l")) grow.length = q.get("l");
  if (q.get("w")) grow.width = q.get("w");
  if (q.get("unit") === "cm" || q.get("unit") === "in") grow.unit = q.get("unit");
  if (q.get("example") === "1") grow.useExample = true;
  if (q.get("rate")) grow.userLow = q.get("rate");
  if (q.get("rateHigh")) grow.userHigh = q.get("rateHigh");
  if (q.get("basis") === "custom" || q.get("basis") === "nominal") grow.basis = q.get("basis");
  else if (grow.tray === "custom") grow.basis = "custom";
  else if (grow.tray) grow.basis = "nominal";
  grow.ok = !!(grow.crop || grow.tray || grow.trays);
  return grow;
}

function ssgGrowParams(state) {
  var params = new URLSearchParams();
  if (state.setup) params.set("setup", state.setup);
  if (state.crop) params.set("crop", state.crop);
  if (state.tray) params.set("tray", state.tray);
  if (state.trays != null) params.set("n", String(state.trays));
  if (state.tray === "custom") {
    if (state.length != null) params.set("l", String(state.length));
    if (state.width != null) params.set("w", String(state.width));
    if (state.unit) params.set("unit", state.unit);
  }
  if (state.basis) params.set("basis", state.basis);
  if (state.useExample) params.set("example", "1");
  else {
    if (state.userLow) params.set("rate", String(state.userLow));
    if (state.userHigh) params.set("rateHigh", String(state.userHigh));
  }
  SSG_PRICE_KEYS.forEach(function (key) { params.delete(key); });
  return params;
}

function ssgSupplyListHref(state) {
  var params = ssgGrowParams(state);
  if (!params.get("setup")) params.set("setup", "tray");
  return "/gear/?" + params.toString() + "#setup-list";
}

function ssgCalculatorHref(state) {
  var params = ssgGrowParams(state);
  params.delete("setup");
  params.delete("basis");
  var query = params.toString();
  return "/tools/microgreens-seed-calculator/" + (query ? "?" + query : "");
}

function ssgComputeGrow(state, crops) {
  if (typeof ssgCompute !== "function") return null;
  var crop = (crops || {})[state.crop] || {};
  if (!state.tray || !state.trays) return null;
  return ssgCompute({
    tray: state.tray,
    trays: state.trays,
    length: state.length,
    width: state.width,
    unit: state.unit || "in",
    crop: crop,
    useExample: !!state.useExample,
    userLow: state.userLow,
    userHigh: state.userHigh,
    price: "",
    priceMode: "unit"
  });
}

function ssgFormatGrowLabel(state, result, crops) {
  var parts = [];
  var crop = (crops || {})[state.crop] || {};
  var cropName = crop.name || (state.crop ? state.crop.charAt(0).toUpperCase() + state.crop.slice(1) : "");
  if (cropName) parts.push(cropName);
  if (state.trays) parts.push(state.trays + " tray" + (state.trays === 1 ? "" : "s"));
  var size = ssgGrowSizeLabel(state);
  if (size) parts.push(size);
  if (result && result.ok && typeof ssgFormatGrams === "function") {
    parts.push(ssgFormatGrams(result.totalHigh) + " seed total");
  }
  return parts.join(" • ");
}

function ssgGrowSizeLabel(state) {
  if (state.tray === "10x20") return "10 × 20 in";
  if (state.tray === "10x10") return "10 × 10 in";
  if (state.tray === "5x5") return "5 × 5 in";
  if (state.tray === "custom") {
    var unit = state.unit === "cm" ? "cm" : "in";
    if (state.length && state.width) return state.length + " × " + state.width + " " + unit;
  }
  return "";
}

function ssgNominalForTray(tray) {
  if (tray === "10x20") return "10x20";
  if (tray === "10x10") return "10x10";
  if (tray === "5x5") return "5x5";
  return "";
}

function ssgMatchSupplies(state, result) {
  var nominal = state.basis === "nominal" ? ssgNominalForTray(state.tray) : "";
  var trayStatus = "none";
  var trayNote = "";
  if (state.tray === "custom" || state.basis === "custom") {
    trayStatus = "custom-unmatched";
    trayNote = "No listed tray is a validated match for a measured interior of " +
      (ssgGrowSizeLabel(state) || "those dimensions") +
      ". Look for a growing tray with drainage holes and a solid catch tray whose inside growing floor is about that size. A nominal tray with the same advertised size may have a smaller interior.";
  } else if (nominal === "10x20" || nominal === "10x10") {
    trayStatus = "exact-nominal";
  } else if (nominal === "5x5" || state.tray) {
    trayStatus = "unmatched";
    trayNote = "No listed tray is a validated match for a " + (ssgGrowSizeLabel(state) || "that") +
      " nominal tray. Look for a growing tray with drainage holes and a solid catch tray whose inside growing floor is about that size. Do not assume a 10 by 10 or 10 by 20 inch tray will fit.";
  }
  var seedNeed = (result && result.ok) ? result.totalHigh : null;
  var trays = state.trays || 1;
  return {
    trayStatus: trayStatus,
    trayNote: trayNote,
    nominal: nominal,
    crop: state.crop || "",
    trays: trays,
    seedNeed: seedNeed,
    recommend: function (card) {
      var role = card.role || "";
      var optional = role.indexOf("optional-") === 0;
      if (optional) return "optional";
      if (role === "growing-holes" || role === "catch-solid") {
        if (trayStatus === "exact-nominal" && card.nominal === nominal) return "essential";
        if (trayStatus === "exact-nominal") return "alternative";
        return "alternative";
      }
      if (role === "seed" || role === "seed-collection") {
        if (state.crop && card.crop === state.crop) return "essential";
        if (state.crop && (card.crop === "mixed" || role === "seed-collection")) return "alternative";
        if (!state.crop && (card.crop === "mixed" || role === "seed-collection")) return "essential";
        if (state.crop) return "hide";
        return "alternative";
      }
      if (role === "kit") return "essential";
      if (role === "medium-mix" || role === "medium-coir" || role === "scale" || role === "scissors") return "essential";
      return "alternative";
    }
  };
}

function ssgSetupCopy(state, result, match, crops) {
  var crop = (crops || {})[state.crop] || {};
  var cropName = crop.name || "your crop";
  var size = ssgGrowSizeLabel(state) || "your tray size";
  var trays = state.trays || 1;
  var seed = (result && result.ok && typeof ssgFormatGrams === "function") ? ssgFormatGrams(result.totalHigh) : "the calculated seed amount";
  var basis = state.basis === "custom" ? "measured interior" : "nominal size";
  var trayLine;
  if (match.trayStatus === "exact-nominal") {
    trayLine = trays + " growing tray" + (trays === 1 ? "" : "s") + " with holes and " +
      trays + " solid catch tray" + (trays === 1 ? "" : "s") + " in the matching " + size + " nominal size.";
  } else {
    trayLine = "a growing tray with holes and a solid catch tray that match " + size + " (" + basis + ").";
  }
  return "For " + trays + " tray" + (trays === 1 ? "" : "s") + " of " + cropName + " at " + size +
    " (" + basis + "): " + trayLine + " Use at least " + seed + " of " + cropName.toLowerCase() +
    " seed, soilless mix, a scale, and scissors. A lamp is optional if the window falls short. " +
    "This is a researched starting basket, not a tested result. Listing specifications were checked 10 November 2026.";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ssgParseGrow: ssgParseGrow,
    ssgGrowParams: ssgGrowParams,
    ssgSupplyListHref: ssgSupplyListHref,
    ssgCalculatorHref: ssgCalculatorHref,
    ssgComputeGrow: ssgComputeGrow,
    ssgFormatGrowLabel: ssgFormatGrowLabel,
    ssgGrowSizeLabel: ssgGrowSizeLabel,
    ssgMatchSupplies: ssgMatchSupplies,
    ssgSetupCopy: ssgSetupCopy
  };
}

window.SSG_CROPS = {"radish": {"name": "Radish", "source": "Utah State University Extension, 42 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days. Mississippi State University Extension gives a volume measure of 2 to 3 tablespoons of radish seed per 10 by 20 inch tray, which is a different way of measuring the same job.", "grams": 42}, "pea": {"name": "Pea", "source": "Utah State University Extension, 150 g per 1020 tray.", "note": "Utah State presoaks pea seed about 6 hours. University of Maryland Extension lists pea among seeds often soaked 6 to 12 hours. Covered about 3 days. Harvest about 8 to 10 days.", "grams": 150}, "sunflower": {"name": "Sunflower", "source": "Utah State University Extension, 48 g per 1020 tray.", "note": "Utah State presoaks sunflower about 12 hours. Covered about 3 days. Harvest about 9 to 10 days. Penn State Extension recommends weight on sunflower seed during germination so hulls release from the cotyledons.", "grams": 48}, "broccoli": {"name": "Broccoli", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 2 to 4 days. Harvest about 8 to 12 days.", "grams": 28}, "kale": {"name": "Kale", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "arugula": {"name": "Arugula", "source": "Utah State University Extension, 10 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 6 to 8 days.", "grams": 10}, "cilantro": {"name": "Cilantro", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "Utah State lists no presoak. University of Maryland Extension includes cilantro among seeds that may be soaked 6 to 12 hours. Covered about 7 to 14 days. Harvest about 21 to 28 days.", "grams": 28}, "basil": {"name": "Basil", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 4 to 7 days. Harvest about 12 to 16 days.", "grams": 28}, "rutabaga": {"name": "Rutabaga", "source": "Utah State University Extension, 28 g per 1020 tray.", "note": "No presoak in the Utah State table. Covered about 1 to 2 days. Harvest about 8 to 12 days.", "grams": 28}, "mustard": {"name": "Mustard", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g (about 1 tablespoon) per 10 by 20 inch flat. It is not a mustard-only weighed rate.", "note": "Mustard is a small brassica seed. Mississippi State University Extension groups mustard with crops often ready about 10 to 15 days after sowing. Treat 10 to 15 g as a starting band for a nominal 10 by 20 inch flat, then adjust the next tray.", "needsRate": true}, "beet": {"name": "Beet", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Beet is listed in that publication's seed-count tables, not as its own weighed tray rate.", "note": "University of Maryland Extension lists beet among seeds that may be soaked 6 to 12 hours. Illinois Extension groups beet with slower-to-germinate choices. Mississippi State University Extension groups beets at about 16 to 25 days.", "needsRate": true}, "amaranth": {"name": "Amaranth", "source": "No crop-specific gram rate was published in the Utah State table. This band is the University of Maryland Extension sample broadcast of about 10 to 15 g per 10 by 20 inch flat. Amaranth is named as a suitable crop there, not given its own gram rate.", "note": "Illinois Extension groups amaranth with slower-to-germinate choices. Mississippi State University Extension groups red amaranth at about 16 to 25 days. The 10 to 15 g band is a general small-seed starting point, not an amaranth trial result.", "needsRate": true}};
(function () {
  'use strict';
  var builder = document.querySelector('.setup-builder');
  if (!builder) return;
  var radios = Array.from(builder.querySelectorAll('input[name="setup-route"]'));
  var panels = Array.from(builder.querySelectorAll('[data-setup-panel]'));
  var tools = builder.querySelector('.supply-tools');
  var count = document.getElementById('supply-count');
  var current = 'kit';
  var owned = {};
  var crops = window.SSG_CROPS || {};
  var grow = typeof ssgParseGrow === 'function' ? ssgParseGrow(window.location.search) : { ok: false };
  var growResult = (grow.ok && typeof ssgComputeGrow === 'function') ? ssgComputeGrow(grow, crops) : null;
  var match = (grow.ok && typeof ssgMatchSupplies === 'function') ? ssgMatchSupplies(grow, growResult) : null;

  function activePanel() {
    return panels.find(function (panel) { return panel.dataset.setupPanel === current; });
  }
  function cardRole(card) {
    return card.dataset.role || '';
  }
  function cardGroup(card) {
    if (!match) {
      if (card.dataset.optional === '1' || (card.dataset.role || '').indexOf('optional-') === 0) return 'optional';
      var role = card.dataset.role || '';
      if ((role === 'growing-holes' || role === 'catch-solid') && card.dataset.nominal && card.dataset.nominal !== '10x20') return 'alternative';
      if (role === 'seed' && card.dataset.crop && card.dataset.crop !== 'mixed') return 'alternative';
      return 'essential';
    }
    return match.recommend({
      role: card.dataset.role || '',
      nominal: card.dataset.nominal || '',
      crop: card.dataset.crop || '',
      id: card.dataset.product || ''
    });
  }
  function isOwnedRole(role) {
    if (!role) return false;
    if (owned[role]) return true;
    if ((role === 'growing-holes' || role === 'catch-solid') && owned['trays']) return true;
    if ((role === 'seed' || role === 'seed-collection') && owned['seed']) return true;
    if (role === 'medium-mix' || role === 'medium-coir') return !!owned['medium-mix'] || !!owned['medium-coir'];
    return false;
  }
  function essentialCards(route) {
    return Array.from(builder.querySelectorAll('[data-routes]')).filter(function (card) {
      if (card.dataset.routes.split(' ').indexOf(route) === -1) return false;
      var group = cardGroup(card);
      return group === 'essential';
    });
  }
  function updateCount() {
    var still = document.querySelectorAll('.supply-group-needed .pick:not([hidden])').length;
    if (!document.querySelector('.supply-groups')) {
      still = essentialCards(current).filter(function (card) { return !isOwnedRole(cardRole(card)); }).length;
    }
    if (count) count.textContent = still ? still + ' essential' + (still === 1 ? '' : 's') + ' left to gather' : 'You have the essentials on this list.';
  }
  var routePicks = Array.from(builder.querySelectorAll('[data-routes]'));
  var routeStatus = document.getElementById('route-picks-status');
  var routeNames = { kit: 'kit', tray: 'reusable-tray', reuse: 'reused-container' };

  function readOwnership() {
    owned = {};
    panels.forEach(function (panel) {
      if (panel.dataset.setupPanel !== current) return;
      Array.from(panel.querySelectorAll('[data-supply]')).forEach(function (box) {
        var role = box.getAttribute('data-role');
        if (role && box.checked) owned[role] = true;
      });
    });
  }
  function applyOwnershipToBoxes() {
    panels.forEach(function (panel) {
      Array.from(panel.querySelectorAll('[data-supply]')).forEach(function (box) {
        var role = box.getAttribute('data-role');
        if (!role) return;
        var should = isOwnedRole(role) || !!owned[role];
        if (box.checked !== should) box.checked = should;
      });
    });
  }
  function ensureGroups() {
    var list = document.getElementById('matching-supplies');
    if (!list) return null;
    var existing = list.querySelector('.supply-groups');
    if (existing) return existing;
    var wrap = document.createElement('div');
    wrap.className = 'supply-groups';
    function section(id, title) {
      var sec = document.createElement('section');
      sec.className = 'supply-group supply-group-' + id;
      sec.id = 'supply-group-' + id;
      var h = document.createElement('h4');
      h.id = 'supply-group-' + id + '-title';
      h.textContent = title;
      sec.setAttribute('aria-labelledby', h.id);
      var ul = document.createElement('ul');
      ul.className = 'pick-grid';
      ul.setAttribute('role', 'list');
      sec.appendChild(h);
      sec.appendChild(ul);
      wrap.appendChild(sec);
      return ul;
    }
    section('needed', 'Still needed');
    section('owned', 'Already have');
    section('optional', 'Optional after your first grow');
    section('alternative', 'Alternatives');
    var grid = list.querySelector('.pick-grid');
    if (grid) list.insertBefore(wrap, grid);
    else list.appendChild(wrap);
    return wrap;
  }
  function placeCards(route) {
    var groups = ensureGroups();
    var original = document.querySelector('#matching-supplies > ul.pick-grid');
    var shown = 0;
    routePicks.forEach(function (card) {
      var onRoute = card.dataset.routes.split(' ').indexOf(route) !== -1;
      var group = onRoute ? cardGroup(card) : 'hide';
      if (group === 'hide' || !onRoute) {
        card.hidden = true;
        if (original && card.parentElement !== original) original.appendChild(card);
        return;
      }
      card.hidden = false;
      shown += 1;
      Array.from(card.querySelectorAll('img[loading="lazy"]')).forEach(function (img) { img.loading = 'eager'; });
      var ownedCard = isOwnedRole(cardRole(card)) && group === 'essential';
      var bucket = ownedCard ? 'owned' : (group === 'optional' ? 'optional' : (group === 'alternative' ? 'alternative' : 'needed'));
      if (groups) {
        var ul = groups.querySelector('.supply-group-' + bucket + ' .pick-grid');
        if (ul) ul.appendChild(card);
      }
    });
    if (groups) {
      Array.from(groups.querySelectorAll('.supply-group')).forEach(function (sec) {
        var has = sec.querySelector('.pick:not([hidden])');
        sec.hidden = !has;
      });
    }
    if (routeStatus && routePicks.length) {
      routeStatus.textContent = shown + ' supplies for your ' + routeNames[route] + ' list.';
      routeStatus.hidden = false;
    }
  }
  function renderHandoff() {
    var box = document.getElementById('grow-handoff');
    if (!box) return;
    if (!grow.ok || !grow.crop && !grow.tray) {
      box.hidden = true;
      return;
    }
    var label = (typeof ssgFormatGrowLabel === 'function') ? ssgFormatGrowLabel(grow, growResult, crops) : '';
    var summary = box.querySelector('[data-grow-summary]');
    var setup = box.querySelector('[data-grow-setup]');
    var note = box.querySelector('[data-grow-note]');
    var edit = box.querySelector('[data-grow-edit]');
    if (summary) summary.textContent = label || 'Your selected grow';
    if (setup && match && typeof ssgSetupCopy === 'function') setup.textContent = ssgSetupCopy(grow, growResult, match, crops);
    if (note) {
      if (match && match.trayNote) {
        note.hidden = false;
        note.textContent = match.trayNote;
      } else {
        note.hidden = true;
      }
    }
    if (edit && typeof ssgCalculatorHref === 'function') {
      edit.href = ssgCalculatorHref(grow);
      edit.hidden = false;
    }
    box.hidden = false;
  }
  function showRoutePicks(route) {
    placeCards(route);
  }
  function selectRoute(route, updateUrl) {
    if (!radios.some(function (radio) { return radio.value === route; })) route = 'kit';
    current = route;
    radios.forEach(function (radio) { radio.checked = radio.value === route; });
    panels.forEach(function (panel) { panel.hidden = panel.dataset.setupPanel !== route; });
    applyOwnershipToBoxes();
    readOwnership();
    showRoutePicks(route);
    updateCount();
    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('setup', route);
      if (['#kit', '#tray', '#reuse'].indexOf(url.hash) !== -1) url.hash = '#setup-list';
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }
  function routeFromLocation() {
    if (grow.setup) return grow.setup;
    var anchor = window.location.hash.slice(1);
    return ['kit', 'tray', 'reuse'].indexOf(anchor) !== -1 ? anchor : new URLSearchParams(window.location.search).get('setup');
  }
  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      selectRoute(radio.value, true);
      if (typeof window.gtag === 'function') window.gtag('event', 'setup_select', { setup_route: current });
    });
  });
  builder.addEventListener('change', function (event) {
    if (event.target.matches('[data-supply]')) {
      var role = event.target.getAttribute('data-role');
      if (role) owned[role] = event.target.checked;
      applyOwnershipToBoxes();
      showRoutePicks(current);
      updateCount();
    }
  });
  window.addEventListener('hashchange', function () {
    var route = routeFromLocation();
    if (route && route !== current) selectRoute(route, false);
  });
  renderHandoff();
  selectRoute(routeFromLocation(), false);
  if (tools) tools.hidden = false;
})();
