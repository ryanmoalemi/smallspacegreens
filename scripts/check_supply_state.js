const fs = require("fs");
const vm = require("vm");
const path = require("path");
const context = { console, URLSearchParams, module: { exports: {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/calc-core.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/supply-state.js"), "utf8"), context);

function assert(name, cond, extra) {
  if (!cond) {
    console.error("FAIL", name, extra || "");
    process.exitCode = 1;
  } else {
    console.log("ok", name);
  }
}

const crops = { radish: { name: "Radish", grams: 42, source: "Utah State University Extension, 42 g per 1020 tray." } };
const grow = context.ssgParseGrow("?setup=tray&crop=radish&tray=10x10&n=3&basis=nominal&price=12&packagePrice=9");
assert("parse keeps the grow and drops prices", grow.ok && grow.crop === "radish" && grow.tray === "10x10" && grow.trays === 3 && grow.setup === "tray" && !grow.price && grow.basis === "nominal", grow);
const href = context.ssgSupplyListHref(grow);
assert("supply href has no price fields", href.startsWith("/gear/?") && href.includes("crop=radish") && href.includes("n=3") && !href.includes("price="), href);
const result = context.ssgComputeGrow(grow, crops);
assert("radish 10x10 x3 is 63 g", result && result.ok && result.perHigh === 21 && result.totalHigh === 63, result);
const label = context.ssgFormatGrowLabel(grow, result, crops);
assert("summary names the grow", label.includes("Radish") && label.includes("3 trays") && label.includes("10") && label.includes("63"), label);
const match = context.ssgMatchSupplies(grow, result);
assert("10x10 is an exact nominal tray match", match.trayStatus === "exact-nominal" && match.recommend({ role: "growing-holes", nominal: "10x10" }) === "essential", match);
assert("1020 trays become alternatives", match.recommend({ role: "growing-holes", nominal: "10x20" }) === "alternative");
assert("radish seed is essential and mixed seed is an alternative", match.recommend({ role: "seed", crop: "radish" }) === "essential" && match.recommend({ role: "seed", crop: "mixed" }) === "alternative");
assert("a lamp stays optional", match.recommend({ role: "optional-light" }) === "optional");

const custom = context.ssgParseGrow("?crop=radish&tray=custom&l=8&w=8&unit=in&n=2&basis=custom");
const customMatch = context.ssgMatchSupplies(custom, context.ssgComputeGrow(custom, crops));
assert("custom size is not silently swapped for a 1010 or 1020", customMatch.trayStatus === "custom-unmatched" && customMatch.trayNote.includes("inside growing floor") && customMatch.recommend({ role: "growing-holes", nominal: "10x10" }) === "alternative", customMatch);

const five = context.ssgParseGrow("?crop=radish&tray=5x5&n=1&basis=nominal");
const fiveMatch = context.ssgMatchSupplies(five, context.ssgComputeGrow(five, crops));
assert("5x5 explains the missing tray match", fiveMatch.trayStatus === "unmatched" && fiveMatch.trayNote.includes("5") && fiveMatch.recommend({ role: "growing-holes", nominal: "10x20" }) === "alternative", fiveMatch);

if (process.exitCode) {
  console.error("supply-state checks failed");
} else {
  console.log("supply-state checks passed");
}
