(function () {
  var ENDPOINT_URL =
    "https://script.google.com/macros/s/AKfycbwZpDAs-cNwbpGHOa3Xfrj361JuDNFEMqTVgqyUiMQO7nUGJD-Kq243Bu82yGH6B61Hew/exec";

  var form = document.getElementById("enquiry-form");
  var status = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var leadType = document.getElementById("lead-type").value;
    var name = document.getElementById("name").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var property = document.getElementById("property").value.trim();

    if (!leadType || !name || !phone || !property) {
      status.textContent = "Please fill in every field so we can get back to you.";
      status.className = "form-status error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    status.textContent = "";
    status.className = "form-status";

    var payload = { name: name, phone: phone, property: property, lead_type: leadType };

    // Google Apps Script web apps don't return CORS headers, so the response
    // body can't be read from the browser. We send the request in "no-cors"
    // mode: if the network request itself doesn't fail, we treat it as a
    // successful submission.
    fetch(ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function () {
        status.textContent =
          "Thanks! One of our team will call you shortly.";
        status.className = "form-status success";
        form.reset();
      })
      .catch(function () {
        status.textContent =
          "Sorry, something went wrong sending your details. Please call us on 0800 123 4567 instead.";
        status.className = "form-status error";
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send my enquiry";
      });
  });
})();
