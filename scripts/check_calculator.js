const fs = require("fs");
const vm = require("vm");
const path = require("path");
const core = fs.readFileSync(path.join(__dirname, "../src/calc-core.js"), "utf8");
const context = { console };
vm.createContext(context);
vm.runInContext(core + "\nthis.ssgCompute = ssgCompute;", context);
const compute = context.ssgCompute;

const radish = { grams: 42, source: "Utah State University Extension, 42 g per 1020 tray." };
const pea = { grams: 150, source: "Utah State University Extension, 150 g per 1020 tray." };
const mustard = { needsRate: true, name: "Mustard" };

function assert(name, cond, extra) {
  if (!cond) {
    console.error("FAIL", name, extra || "");
    process.exitCode = 1;
  } else {
    console.log("ok", name);
  }
}
function close(a, b, tol) {
  return Math.abs(a - b) <= (tol || 0.02);
}

let r = compute({ tray: "10x20", trays: 1, crop: radish, price: "", priceMode: "unit" });
assert("radish 10x20", r.ok && r.perLow === 42, r);

r = compute({ tray: "10x10", trays: 1, crop: radish, price: "", priceMode: "unit" });
assert("radish 10x10", r.ok && r.perLow === 21, r);

r = compute({ tray: "10x10", trays: 3, crop: radish, price: "12", priceMode: "unit", priceUnit: "lb" });
assert("three trays cost", r.ok && r.totalLow === 63 && close(r.cost.perLow, 0.56, 0.01) && close(r.cost.totalLow, 1.67, 0.01), r.cost);

r = compute({ tray: "custom", length: 25.4, width: 50.8, unit: "cm", trays: 1, crop: radish, price: "", priceMode: "unit" });
assert("cm matches 10x20", r.ok && close(r.perLow, 42, 0.001), r);

r = compute({ tray: "5x5", trays: 1, crop: pea, price: "", priceMode: "unit" });
assert("pea 5x5", r.ok && close(r.perLow, 18.75, 0.001), r);

r = compute({ tray: "10x20", trays: 1, crop: radish, price: "", priceMode: "unit" });
assert("blank price", r.ok && r.cost.kind === "blank");

r = compute({ tray: "10x20", trays: 1, crop: radish, price: "0", priceMode: "unit", priceUnit: "lb" });
assert("zero price", r.ok && r.cost.kind === "unit" && r.cost.totalLow === 0);

r = compute({ tray: "10x20", trays: 1, crop: radish, price: "-1", priceMode: "unit" });
assert("negative price", !r.ok);

r = compute({ tray: "custom", length: 0, width: 10, unit: "in", trays: 1, crop: radish, priceMode: "unit" });
assert("zero dimension", !r.ok);

r = compute({ tray: "10x20", trays: 1.5, crop: radish, priceMode: "unit" });
assert("fractional trays", !r.ok);

r = compute({ tray: "custom", length: 1e308, width: 1e308, unit: "in", trays: 1, crop: radish, priceMode: "unit" });
assert("overflow", !r.ok && !/infinity|NaN/i.test(r.error || ""), r);

r = compute({ tray: "10x20", trays: 1, crop: mustard, priceMode: "unit" });
assert("mustard blocked", !r.ok);

r = compute({ tray: "10x20", trays: 1, crop: mustard, useExample: true, priceMode: "unit" });
assert("mustard example band", r.ok && r.generic && r.perLow === 10 && r.perHigh === 15);

r = compute({
  tray: "10x20", trays: 3, crop: radish, priceMode: "package",
  packagePrice: 10, packageGrams: 100
});
assert("package checkout", r.ok && r.cost.kind === "package" && r.cost.low.needed === 126 && r.cost.low.packages === 2 && r.cost.low.completeTrays === 2 && close(r.cost.low.checkout, 20, 0.001), r.cost && r.cost.low);

if (process.exitCode) process.exit(process.exitCode);
console.log("calculator checks passed");
