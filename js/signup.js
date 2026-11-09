(function () {
  "use strict";
  var forms = document.querySelectorAll(".signup-form");
  if (!forms.length) return;
  var endpoint = "https://qlhwojjdsonjxfeoiqww.supabase.co/functions/v1/ssg-signup";

  function showError(form, message) {
    var error = form.querySelector(".signup-error");
    var button = form.querySelector('button[type="submit"]');
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
    if (button) {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      if (button.dataset.label) button.textContent = button.dataset.label;
    }
  }

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailInput = form.querySelector('input[name="email"]');
      var websiteInput = form.querySelector('input[name="website"]');
      var button = form.querySelector('button[type="submit"]');
      var email = emailInput ? emailInput.value.trim() : "";
      var website = websiteInput ? websiteInput.value : "";
      if (!email || email.indexOf("@") < 1) {
        showError(form, "Enter an email address so Ryan can send the checklist.");
        return;
      }
      if (button) {
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.dataset.label = button.textContent;
        button.textContent = "Sending";
      }
      var error = form.querySelector(".signup-error");
      if (error) error.hidden = true;
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, website: website })
      }).then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        }).catch(function () {
          return { ok: false, data: {} };
        });
      }).then(function (result) {
        if (result.ok && result.data && result.data.ok === true) {
          if (typeof gtag === "function") {
            gtag("event", "sign_up", { method: "checklist" });
          }
          window.location.href = "/subscribe/check-email/";
          return;
        }
        showError(form, "That address could not be added. Try again in a moment, or email ryan@smallspacegreens.com.");
      }).catch(function () {
        showError(form, "The signup did not go through. Check your connection and try again, or email ryan@smallspacegreens.com.");
      });
    });
  });
})();
