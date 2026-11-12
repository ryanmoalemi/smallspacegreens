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
