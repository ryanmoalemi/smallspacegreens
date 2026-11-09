(function (root) {
  "use strict";

  var MAX_PRICE = 10000;
  var MAX_PLANTINGS = 1000;
  var routes = ["kit", "diy"];
  var routeNames = { kit: "Kit", diy: "DIY" };
  var priceFields = ["base", "extras", "delivery", "refill"];
  var fieldNames = {
    base: "base price",
    extras: "other supplies",
    delivery: "delivery and tax",
    refill: "next-planting cost",
    plantings: "plantings included"
  };

  function readMoney(raw, optional) {
    var value = raw == null ? "" : String(raw).trim();
    if (value === "") {
      return optional
        ? { ok: true, cents: null }
        : { ok: false, error: "Enter a price, or 0 if there is no charge." };
    }
    // Accept US decimal prices and correctly grouped thousands, without exponents.
    if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)) {
      return { ok: false, error: "Use a price from 0 to 10,000 with up to two decimal places." };
    }
    var number = Number(value.replace(/,/g, ""));
    if (!Number.isFinite(number) || number < 0 || number > MAX_PRICE) {
      return { ok: false, error: "Use a price from 0 to 10,000." };
    }
    return { ok: true, cents: Math.round(number * 100) };
  }

  function readPlantings(raw) {
    var value = raw == null ? "" : String(raw).trim();
    var number = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < 1 || number > MAX_PLANTINGS) {
      return { ok: false, error: "Enter a whole number of complete plantings from 1 to 1,000." };
    }
    return { ok: true, count: number };
  }

  function calculate(input) {
    var result = { ok: false, errors: [] };
    routes.forEach(function (route) {
      var entered = input && input[route] ? input[route] : {};
      var basket = {};
      priceFields.forEach(function (field) {
        var checked = readMoney(entered[field], field === "refill");
        if (!checked.ok) {
          result.errors.push({ field: route + "-" + field, error: checked.error });
        } else {
          basket[field + "Cents"] = checked.cents;
        }
      });
      var plantings = readPlantings(entered.plantings);
      if (!plantings.ok) {
        result.errors.push({ field: route + "-plantings", error: plantings.error });
      } else {
        basket.plantings = plantings.count;
      }
      result[route] = basket;
    });
    if (result.errors.length) return result;
    routes.forEach(function (route) {
      var basket = result[route];
      basket.todayCents = basket.baseCents + basket.extrasCents + basket.deliveryCents;
    });
    result.ok = true;
    result.differenceCents = result.kit.todayCents - result.diy.todayCents;
    return result;
  }

  function money(cents) {
    return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function differenceText(result) {
    var difference = result.differenceCents;
    var text = difference === 0
      ? "Both setups have the same pay-today total."
      : (difference < 0 ? "Kit" : "DIY") + " requires " + money(Math.abs(difference)) + " less upfront.";
    if (result.kit.plantings !== result.diy.plantings) {
      text += " These baskets supply different numbers of plantings; compare the quantities as well as the totals.";
    }
    return text;
  }

  function comparisonText(result) {
    if (!result || !result.ok) return "";
    var lines = ["Small Space Greens | Setup cost comparison (USD)", "Prices entered by you."];
    routes.forEach(function (route) {
      var basket = result[route];
      lines.push(
        "",
        routeNames[route],
        "Base price: " + money(basket.baseCents),
        "Other supplies: " + money(basket.extrasCents),
        "Delivery and tax: " + money(basket.deliveryCents),
        "Pay today: " + money(basket.todayCents),
        "Complete plantings included: " + basket.plantings,
        "Next planting, consumables: " + (basket.refillCents === null ? "Unknown" : money(basket.refillCents))
      );
    });
    lines.push("", differenceText(result), "Next-planting costs are separate from pay-today totals.", "https://smallspacegreens.com/guides/microgreens-kit-vs-diy-cost/#cost-comparison");
    return lines.join("\n");
  }

  // Small pure interface also allows the price arithmetic to be checked without a browser.
  root.SSGCostCompare = { calculate: calculate, comparisonText: comparisonText };
  if (typeof document === "undefined") return;

  var section = document.getElementById("cost-comparison");
  var form = document.getElementById("cost-compare-form");
  if (!section || !form || section.dataset.costReady === "true") return;
  section.dataset.costReady = "true";
  var results = document.getElementById("cost-compare-results");
  var heading = document.getElementById("cost-results-title");
  var status = document.getElementById("cost-form-status");
  var submitButton = document.getElementById("cost-compare-submit");
  var copyButton = document.getElementById("cost-copy");
  var copyStatus = document.getElementById("cost-copy-status");
  var copyDetails = document.getElementById("cost-copy-details");
  var copyField = document.getElementById("cost-copy-text");
  var lastResult = null;
  submitButton.disabled = false;

  function field(id) {
    return document.getElementById("cost-" + id);
  }

  function clearError(id) {
    var input = field(id);
    var error = document.getElementById("cost-" + id + "-error");
    if (input) input.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  }

  function clearErrors() {
    routes.forEach(function (route) {
      priceFields.concat(["plantings"]).forEach(function (name) { clearError(route + "-" + name); });
    });
    status.classList.remove("is-error");
  }

  function readForm() {
    var input = {};
    routes.forEach(function (route) {
      input[route] = {};
      priceFields.concat(["plantings"]).forEach(function (name) {
        input[route][name] = field(route + "-" + name).value;
      });
    });
    return input;
  }

  function hideResults() {
    lastResult = null;
    results.hidden = true;
    copyButton.disabled = true;
    copyStatus.textContent = "";
    copyDetails.open = false;
    copyField.value = "";
  }

  function render(result) {
    lastResult = result;
    routes.forEach(function (route) {
      var basket = result[route];
      document.getElementById("cost-" + route + "-today-result").textContent = money(basket.todayCents);
      document.getElementById("cost-" + route + "-plantings-result").textContent = basket.plantings.toLocaleString("en-US");
      document.getElementById("cost-" + route + "-refill-result").textContent = basket.refillCents === null ? "Unknown" : money(basket.refillCents);
    });
    document.getElementById("cost-difference").textContent = differenceText(result);
    copyField.value = comparisonText(result);
    copyButton.disabled = false;
    results.hidden = false;
    status.textContent = "Comparison updated from your prices.";
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    hideResults();
    var result = calculate(readForm());
    if (!result.ok) {
      result.errors.forEach(function (issue) {
        var input = field(issue.field);
        var error = document.getElementById("cost-" + issue.field + "-error");
        input.setAttribute("aria-invalid", "true");
        error.textContent = issue.error;
        error.hidden = false;
      });
      var first = result.errors[0];
      var parts = first.field.split("-");
      status.textContent = "Check " + result.errors.length + " field" + (result.errors.length === 1 ? "" : "s") + ". " + routeNames[parts[0]] + " " + fieldNames[parts[1]] + ": " + first.error;
      status.classList.add("is-error");
      field(first.field).focus();
      return;
    }
    render(result);
  });

  form.addEventListener("input", function (event) {
    if (!event.target.id || event.target.id.indexOf("cost-") !== 0) return;
    clearError(event.target.id.slice(5));
    if (lastResult) {
      hideResults();
      status.classList.remove("is-error");
      status.textContent = "Prices changed. Compare again to update the totals.";
    }
  });

  form.addEventListener("reset", function () {
    clearErrors();
    hideResults();
    status.textContent = "Prices cleared.";
  });

  copyButton.addEventListener("click", async function () {
    if (!lastResult || !lastResult.ok) return;
    var copiedResult = lastResult;
    var text = comparisonText(copiedResult);
    try {
      if (!root.navigator || !root.navigator.clipboard || !root.navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await root.navigator.clipboard.writeText(text);
      if (lastResult !== copiedResult) return;
      copyStatus.textContent = "Comparison copied.";
    } catch (error) {
      if (lastResult !== copiedResult) return;
      copyDetails.open = true;
      copyField.value = text;
      copyField.focus();
      copyField.select();
      copyStatus.textContent = "Automatic copying is unavailable. Select and copy the comparison text below.";
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
