// Shared enquiry submission, used by the homepage form and the listing page's
// "Schedule a tour" / "Ask a question" forms.
(function () {
  var ENDPOINT_URL =
    "https://script.google.com/macros/s/AKfycbw33fYVAYXbH-G7sEGoz-z02pso7XDG7juASDjvIr6dz_-E3bgo-zB9f2XLoyESbX06zQ/exec";

  // Google Apps Script web apps don't return CORS headers, so the response body
  // can't be read from the browser. We send in "no-cors" mode: if the network
  // request itself doesn't fail, we treat it as a successful submission.
  window.submitEnquiry = function (payload) {
    return fetch(ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  };

  window.SIMPLIFYE_SUCCESS_MESSAGE = "Thanks! One of our team will call you shortly.";
  window.SIMPLIFYE_ERROR_MESSAGE =
    "Sorry, something went wrong sending your details. Please call us on 0800 123 4567 instead.";
})();
