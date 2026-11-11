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

r = compute({ tray: "custom", length: 0.01, width: 10, unit: "in", trays: 1, crop: radish });
assert("custom dimensions honor the visible minimum", !r.ok);

r = compute({ tray: "10x20", trays: 3, crop: radish, priceMode: "package", packagePrice: 12, packageGrams: 500 });
assert("500g package plan", r.ok && r.cost.low.needed === 126 && r.cost.low.completeTrays === 11 && r.cost.low.packages === 1 && r.cost.low.leftover === 374 && close(r.cost.low.consumed, 3.024, 0.001) && r.cost.low.checkout === 12, r.cost);

r = compute({ tray: "10x20", trays: 3, crop: radish, priceMode: "package", packagePrice: 12, packageGrams: 126 });
assert("exact package boundary", r.ok && r.cost.low.completeTrays === 3 && r.cost.low.packages === 1 && r.cost.low.leftover === 0, r.cost);

r = compute({ tray: "10x20", trays: 3, crop: mustard, userLow: 20, userHigh: 60, priceMode: "package", packagePrice: 10, packageGrams: 100 });
assert("rate-range package scenarios remain separate", r.ok && r.cost.low.packages === 1 && r.cost.low.leftover === 40 && r.cost.high.packages === 2 && r.cost.high.leftover === 20, r.cost);

// Exercise the actual form event handlers without a browser or third-party DOM library.
function mountCalculator(search, packs) {
  function element(value) {
    return {
      value: value == null ? "" : value, hidden: false, disabled: false,
      textContent: "", innerHTML: "", handlers: {},
      addEventListener(type, handler) { this.handlers[type] = handler; },
      focus() { this.focused = true; }, select() { this.selected = true; }
    };
  }
  const defaults = { sideLength: "10", sideWidth: "20", unit: "in", trays: "1", crop: "radish", useExample: "0", userLow: "", userHigh: "", priceMode: "unit", price: "", priceUnit: "lb", packagePrice: "", packageGrams: "" };
  const form = element();
  Object.keys(defaults).forEach(key => { form[key] = element(defaults[key]); });
  let tray = "10x20";
  const radios = {};
  ["10x20", "10x10", "5x5", "custom"].forEach(value => {
    radios[value] = { value };
    Object.defineProperty(radios[value], "checked", { get: () => tray === value, set: checked => { if (checked) tray = value; } });
  });
  form.querySelector = selector => {
    if (selector === 'input[name="tray"]:checked') return radios[tray];
    const match = selector.match(/^input\[name="tray"\]\[value="(10x20|10x10|5x5|custom)"\]$/);
    if (!match) throw new Error("Untrusted or invalid tray selector: " + selector);
    return radios[match[1]];
  };
  form.reset = () => { Object.keys(defaults).forEach(key => { form[key].value = defaults[key]; }); tray = "10x20"; };
  const nodes = { "calc-form": form };
  ["calc-results", "calc-summary", "custom-dims", "rate-box", "unit-price-fields", "package-price-fields", "copy-result", "print-result", "calc-action-status", "calc-copy-fallback", "use-example", "clear-example", "reset-calc"].forEach(id => { nodes[id] = element(); });
  nodes["custom-dims"].querySelectorAll = () => [form.sideLength, form.sideWidth, form.unit];
  nodes["rate-box"].querySelectorAll = () => [form.useExample, form.userLow, form.userHigh, nodes["use-example"], nodes["clear-example"]];
  nodes["unit-price-fields"].querySelectorAll = () => [form.price, form.priceUnit];
  nodes["package-price-fields"].querySelectorAll = () => [form.packagePrice, form.packageGrams];
  const win = { location: new URL("https://smallspacegreens.com/tools/microgreens-seed-calculator/" + (search || "")), SSG_CROPS: { radish: { ...radish, name: "Radish" }, mustard } };
  if (packs) win.SSG_PACKS = packs;
  win.history = { replaceState(_state, _title, next) { win.location = new URL(next, win.location.href); } };
  win.print = () => { win.printed = true; };
  const clipboard = { text: null, fail: false, async writeText(text) { if (this.fail) throw new Error("Permission denied"); this.text = text; } };
  const sandbox = { window: win, document: { getElementById: id => nodes[id] || null }, navigator: { clipboard }, URLSearchParams };
  vm.createContext(sandbox);
  vm.runInContext(core + "\n" + fs.readFileSync(path.join(__dirname, "../src/calculator.js"), "utf8"), sandbox);
  return { form, nodes, win, clipboard, edit(name, value) { form[name].value = value; form.handlers.input({ target: form[name] }); }, click(id) { return nodes[id].handlers.click(); } };
}

async function checkFormBehavior() {
  const ui = mountCalculator();
  ui.edit("crop", "mustard");
  ui.click("use-example");
  ui.edit("userLow", "20");
  ui.edit("userHigh", "30");
  assert("manual rate overrides the chosen example", ui.form.useExample.value === "0" && /20 g to 30 g/.test(ui.nodes["calc-summary"].textContent) && !ui.win.location.search.includes("example="));

  ui.edit("packagePrice", "-1");
  assert("unused package fields cannot block unit mode", ui.form.packagePrice.disabled && ui.form.packageGrams.disabled && !ui.form.price.disabled);
  ui.edit("priceMode", "package");
  assert("switching price mode enables only its fields", ui.form.price.disabled && ui.form.priceUnit.disabled && !ui.form.packagePrice.disabled);

  ui.edit("crop", "radish");
  ui.edit("trays", "3");
  ui.edit("packagePrice", "12");
  ui.edit("packageGrams", "500");
  await ui.click("copy-result");
  assert("copied result includes crop, tray and package costs", /Crop: Radish/.test(ui.clipboard.text) && /Tray: 10 by 20/.test(ui.clipboard.text) && /126 g/.test(ui.clipboard.text) && /checkout spend: \$12.00/.test(ui.clipboard.text), ui.clipboard.text);
  assert("copy success is announced", !ui.nodes["calc-action-status"].hidden && /copied/.test(ui.nodes["calc-action-status"].textContent));
  assert("page address keeps tray settings but excludes price inputs", ui.win.location.search.includes("crop=radish") && !/price|package|500/.test(ui.win.location.search), ui.win.location.search);
  assert("there is no share button", !/copy-link|Copy link/.test(fs.readFileSync(path.join(__dirname, "../src/pages/calculator.html"), "utf8") + fs.readFileSync(path.join(__dirname, "../src/calculator.js"), "utf8")));

  ui.clipboard.fail = true;
  await ui.click("copy-result");
  assert("clipboard failure provides selectable text", !ui.nodes["calc-copy-fallback"].hidden && ui.nodes["calc-copy-fallback"].selected && /Crop: Radish/.test(ui.nodes["calc-copy-fallback"].value));

  ui.click("reset-calc");
  assert("reset restores valid defaults", ui.form.crop.value === "radish" && ui.form.trays.value === "1" && ui.form.priceMode.value === "unit" && ui.form.packagePrice.value === "" && ui.nodes["calc-copy-fallback"].hidden);
  ui.edit("trays", "1.5");
  assert("invalid results cannot be copied or printed", ui.nodes["copy-result"].disabled && ui.nodes["print-result"].disabled);

  const malformed = mountCalculator("?tray=%22%5D&crop=radish");
  assert("malformed shared tray does not break initialization", /42 g/.test(malformed.nodes["calc-summary"].textContent));
  const legacy = mountCalculator("?crop=mustard&example=1&rate=20&rateHigh=30");
  assert("conflicting legacy example links show the actual example", legacy.form.userLow.value === "10" && legacy.form.userHigh.value === "15" && /10 g to 15 g/.test(legacy.nodes["calc-summary"].textContent));

  if (process.exitCode) process.exit(process.exitCode);
  console.log("calculator checks passed");
}
checkFormBehavior().catch(error => { console.error(error); process.exitCode = 1; });

// Package suggestion before the seller click (sizes from src/trueleaf-packages.json).
vm.runInContext("this.ssgPickPackage = ssgPickPackage;", context);
const pick = context.ssgPickPackage;
const radishSizes = [
  { label: "4 g packet", grams: 4 }, { label: "4 oz", grams: 113.4 }, { label: "1 lb", grams: 453.6 },
  { label: "5 lb", grams: 2268 }, { label: "25 lb", grams: 11339.8 }
];
let p = pick(radishSizes, 21, 21);
assert("radish 10x10 suggests 4 oz, 5 sowings", p && p.size.label === "4 oz" && p.sowings === 5 && p.coversBatch && p.smallerShort.length === 1, p);
p = pick(radishSizes, 21, 21 * 6);
assert("six radish trays move up to 1 lb", p && p.size.label === "1 lb" && p.sowings === 21, p);
p = pick(radishSizes, 1, 1);
assert("a 4 g packet is enough when it covers three sowings", p && p.size.label === "4 g packet" && p.sowings === 4, p);
p = pick(radishSizes, 42, 42);
assert("radish 10x20 moves to a size with at least three sowings", p && p.size.label === "1 lb" && p.sowings === 10, p);
const broccoliSizes = [{ label: "1 oz", grams: 28.3 }, { label: "4 oz", grams: 113.4 }, { label: "1 lb", grams: 453.6 }];
p = pick(broccoliSizes, 28, 28);
assert("broccoli 10x20 skips the one-sowing 1 oz", p && p.size.label === "4 oz" && p.sowings === 4, p);
p = pick(broccoliSizes, 5, 5);
assert("arugula 10x10 keeps 1 oz with five sowings", p && p.size.label === "1 oz" && p.sowings === 5, p);
p = pick([{ label: "1 lb", grams: 453.6 }], 150, 150 * 4);
assert("batch above largest size is flagged", p && !p.coversBatch && p.sowings === 3, p);
assert("no sizes gives no suggestion", pick([], 21, 21) === null);

// Out-of-stock sizes are never recommended (stock from src/trueleaf-packages.json).
const radishStock = [
  { label: "4 g packet", grams: 4 }, { label: "4 oz", grams: 113.4 }, { label: "1 lb", grams: 453.6, inStock: false },
  { label: "5 lb", grams: 2268, inStock: false }, { label: "25 lb", grams: 11339.8 }
];
p = pick(radishStock, 42, 42);
assert("radish 10x20 falls back to 4 oz while 1 lb is out", p && p.size.label === "4 oz" && p.sowings === 2 && p.coversBatch, p);
p = pick(radishStock, 21, 21);
assert("radish 10x10 still 4 oz", p && p.size.label === "4 oz" && p.sowings === 5, p);
p = pick(radishStock, 450, 450);
assert("out-of-stock 1 lb with nothing usable smaller falls back below, flagged", p && p.size.label === "4 oz" && !p.coversBatch, p);
p = pick([{ label: "1 lb", grams: 453.6, inStock: false }, { label: "5 lb", grams: 2268 }], 150, 150);
assert("no smaller in-stock size moves to the next larger", p && p.size.label === "5 lb", p);
const arugulaStock = [
  { label: "1 oz", grams: 28.3 }, { label: "4 oz", grams: 113.4 }, { label: "1 lb", grams: 453.6 },
  { label: "5 lb", grams: 2268, inStock: false }, { label: "25 lb", grams: 11339.8 }
];
let chose5lb = false;
for (const per of [5, 10, 20, 40]) {
  for (let n = 1; n <= 300; n++) {
    const r = pick(arugulaStock, per, per * n);
    if (!r || r.size.inStock === false || r.size.label === "5 lb") chose5lb = true;
  }
}
assert("arugula never recommends the out-of-stock 5 lb", !chose5lb);
p = pick(arugulaStock, 10, 10 * 60);
assert("arugula batch past 1 lb falls back to 1 lb, not 5 lb", p && p.size.label === "1 lb" && !p.coversBatch, p);

// Amazon offer only when the True Leaf pick is out of stock, closest quantity, in stock.
const radishAmazon = [
  { label: "16 oz", grams: 453.6, inStock: true, url: "https://www.amazon.com/dp/B08V1ZMGFX?tag=smallspaceg04-20", title: "Country Creek Rambo radish seed, 16 oz", match: "Same variety (Rambo).", imageEmbed: null },
  { label: "5 lb", grams: 2268, inStock: true, url: "https://www.amazon.com/dp/B088MJWC7S?tag=smallspaceg04-20", title: "Purple radish seed, 5 lb", match: "Purple radish.", imageEmbed: null }
];
p = pick(radishStock, 42, 42, radishAmazon);
assert("radish 10x20 with 1 lb out shows the Amazon 16 oz", p && p.merchant === "amazon" && p.size.label === "16 oz" && p.replaced.label === "1 lb" && p.sowings === 10 && p.coversBatch, p);
p = pick(radishStock, 42, 42 * 20, radishAmazon);
assert("radish 5 lb out shows the Amazon 5 lb", p && p.merchant === "amazon" && p.size.label === "5 lb" && p.replaced.label === "5 lb", p);
p = pick(radishStock, 21, 21, radishAmazon);
assert("an in-stock True Leaf pick never uses Amazon", p && p.merchant === "trueleaf" && p.size.label === "4 oz", p);
p = pick(radishStock, 42, 42, [{ label: "16 oz", grams: 453.6, inStock: false }]);
assert("an out-of-stock Amazon offer is skipped, True Leaf fallback stays", p && p.merchant === "trueleaf" && p.size.label === "4 oz", p);
const amaranthStock = [
  { label: "1 oz", grams: 28.3 }, { label: "4 oz", grams: 113.4, inStock: false }, { label: "1 lb", grams: 453.6, inStock: false },
  { label: "5 lb", grams: 2268, inStock: false }, { label: "25 lb", grams: 11339.8, inStock: false }
];
const amaranthAmazon = [{ label: "0.25 lb", grams: 113.4 }, { label: "1 lb", grams: 453.6 }, { label: "5 lb", grams: 2268 }];
p = pick(amaranthStock, 15, 15, amaranthAmazon);
assert("amaranth 10x20 at the Maryland example shows the Amazon 0.25 lb", p && p.merchant === "amazon" && p.size.label === "0.25 lb" && p.sowings === 7, p);
p = pick(amaranthStock, 15, 15 * 900, amaranthAmazon);
assert("amaranth 25 lb out falls to the largest Amazon offer, flagged", p && p.merchant === "amazon" && p.size.label === "5 lb" && !p.coversBatch, p);
p = pick(amaranthStock, 5, 5, amaranthAmazon);
assert("amaranth small batch keeps the in-stock True Leaf 1 oz", p && p.merchant === "trueleaf" && p.size.label === "1 oz", p);

const photo = { src: "/assets/photos/thumbs/radish-seeds-hugowolf.jpg", alt: "Loose brown radish seeds.", credit: "/photo-credits/#radish-seeds-hugowolf", author: "Hugowolf" };
const boxPacks = {
  radish: { product: "Organic Rambo Radish microgreens seed", stockDate: "Nov 10, 2026", amazonDate: "Nov 10, 2026", photo, amazon: radishAmazon,
    sizes: radishStock.map(s => ({ ...s, unit: s.label.split(" ")[1], url: "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=x" })) },
  mustard: { product: "Green Mustard microgreens seed", stockDate: "Nov 10, 2026", amazonDate: null, photo: { ...photo, author: "M" }, amazon: [],
    sizes: [{ label: "1 oz", unit: "oz", grams: 28.3, url: "u1" }, { label: "4 oz", unit: "oz", grams: 113.4, url: "u4" }] }
};
const amz = mountCalculator("?crop=radish&tray=10x20&n=1", boxPacks);
const amzHtml = amz.nodes["calc-results"].innerHTML;
assert("Amazon box shows the tagged /dp/ URL with rel sponsored nofollow", /href='https:\/\/www\.amazon\.com\/dp\/B08V1ZMGFX\?tag=smallspaceg04-20' rel='sponsored nofollow' target='_blank'>View on Amazon</.test(amzHtml), amzHtml);
assert("Amazon box has the crop photo and a one-line credit, not an Amazon image, while image_embed is empty", !/example photo/i.test(amzHtml) && /radish-seeds-hugowolf/.test(amzHtml) && /class='photo-credit credit-line result-pack-credit'[^>]*>Photo: <a/.test(amzHtml) && !/amazon-adsystem|media-amazon/.test(amzHtml));
assert("Amazon small print is one short line", (amzHtml.match(/<p class='result-pack-sizes'>([^<]*)</) || [])[1].split(". ").length === 2, amzHtml);
assert("Amazon box says why it left True Leaf", /True Leaf(?:'|&#39;|&#x27;)s 1 lb was sold out on Nov 10, 2026\. Check size and stock on Amazon\./.test(amzHtml));
assert("package copy never says link", !/\blink\b/i.test(amzHtml.replace(/class='result-pack-link'/g, "")));
boxPacks.radish.amazon = radishAmazon.map(o => ({ ...o, imageEmbed: "https://m.media-amazon.com/images/I/test._SL250_.jpg" }));
const emb = mountCalculator("?crop=radish&tray=10x20&n=1", boxPacks).nodes["calc-results"].innerHTML;
assert("image_embed swaps in the Amazon-served image for that offer only", /src='https:\/\/m\.media-amazon\.com\/images\/I\/test\._SL250_\.jpg'/.test(emb) && !/result-pack-credit/.test(emb) && !/example photo/i.test(emb));
const mus = mountCalculator("?crop=mustard&tray=10x20&n=1&example=1", boxPacks).nodes["calc-results"].innerHTML;
assert("mustard box sizes from the Maryland example and says so", /Sized with the Maryland example rate, using its upper end of 15 g per tray/.test(mus) && /4 oz/.test(mus) && !/example photo/i.test(mus), mus);
const mus2 = mountCalculator("?crop=mustard&tray=10x20&n=1&rate=20", boxPacks).nodes["calc-results"].innerHTML;
assert("mustard box at a typed rate says it used your rate", /Sized with your rate, 20 g per tray/.test(mus2), mus2);
assert("Amazon radish box has no packet sentence", !/less than one tray|4 g packet/.test(amzHtml), amzHtml);
const r10 = mountCalculator("?crop=radish&tray=10x10&n=1", boxPacks).nodes["calc-results"].innerHTML;
assert("True Leaf radish box has no packet sentence", /4 oz/.test(r10) && !/less than one tray|4 g packet is/.test(r10), r10);
