(function () {
  var properties = window.SIMPLIFYE_PROPERTIES || [];
  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get("id");

  var property = properties.filter(function (p) { return p.id === requestedId; })[0];

  if (!property) {
    document.getElementById("listing-missing").hidden = false;
    return;
  }

  document.getElementById("listing-page").hidden = false;

  function formatPrice(value) {
    return "£" + value.toLocaleString("en-GB") + " pcm";
  }

  /* ---------- Populate details ---------- */
  document.title = property.address + ", " + property.city + " — Simplifye Lettings";
  document.getElementById("crumb-city").textContent = property.city;
  document.getElementById("crumb-address").textContent = property.address;
  document.getElementById("listing-price").textContent = formatPrice(property.price);
  document.getElementById("listing-specs").innerHTML =
    "<strong>" + property.beds + "</strong> bed &nbsp;<strong>" + property.baths +
    "</strong> bath &nbsp;<strong>" + property.sqft.toLocaleString("en-GB") +
    "</strong> sqft &nbsp;" + property.type;
  document.getElementById("listing-address").textContent = property.address;
  document.getElementById("listing-area").textContent = property.area + ", " + property.city;
  document.getElementById("fact-beds").textContent = property.beds;
  document.getElementById("fact-baths").textContent = property.baths;
  document.getElementById("fact-type").textContent = property.type;
  document.getElementById("fact-sqft").textContent = property.sqft.toLocaleString("en-GB") + " sqft";
  document.getElementById("fact-available").textContent = property.availableFrom;
  document.getElementById("listing-desc").textContent = property.fullDesc;

  var badge = document.getElementById("listing-badge");
  if (property.badge) {
    badge.textContent = property.badge;
    badge.setAttribute("data-badge", property.badge);
    badge.hidden = false;
  }

  /* ---------- Gallery ---------- */
  var galleryImage = document.getElementById("gallery-image");
  var galleryCounter = document.getElementById("gallery-counter");
  var thumbsContainer = document.getElementById("gallery-thumbs");
  var currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + property.images.length) % property.images.length;
    galleryImage.src = property.images[currentIndex];
    galleryImage.alt = property.address + " — photo " + (currentIndex + 1);
    galleryCounter.textContent = (currentIndex + 1) + " / " + property.images.length;
    thumbsContainer.querySelectorAll(".gallery-thumb").forEach(function (thumb, i) {
      thumb.classList.toggle("gallery-thumb-active", i === currentIndex);
    });
  }

  property.images.forEach(function (src, index) {
    var thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "gallery-thumb";
    thumb.setAttribute("aria-label", "View photo " + (index + 1));
    thumb.innerHTML = '<img alt="" loading="lazy">';
    thumb.querySelector("img").src = src;
    thumb.addEventListener("click", function () { showImage(index); });
    thumbsContainer.appendChild(thumb);
  });

  document.getElementById("gallery-prev").addEventListener("click", function () {
    showImage(currentIndex - 1);
  });
  document.getElementById("gallery-next").addEventListener("click", function () {
    showImage(currentIndex + 1);
  });

  showImage(0);

  /* ---------- Tabs ---------- */
  var tabTour = document.getElementById("tab-tour");
  var tabQuestion = document.getElementById("tab-question");
  var panelTour = document.getElementById("panel-tour");
  var panelQuestion = document.getElementById("panel-question");

  function selectTab(showTour) {
    tabTour.classList.toggle("booking-tab-active", showTour);
    tabQuestion.classList.toggle("booking-tab-active", !showTour);
    tabTour.setAttribute("aria-selected", String(showTour));
    tabQuestion.setAttribute("aria-selected", String(!showTour));
    panelTour.hidden = !showTour;
    panelQuestion.hidden = showTour;
  }

  tabTour.addEventListener("click", function () { selectTab(true); });
  tabQuestion.addEventListener("click", function () { selectTab(false); });

  /* ---------- Tour day / time picker ---------- */
  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var tourDaysContainer = document.getElementById("tour-days");
  var tourTimeButtons = document.querySelectorAll(".tour-time-btn");
  var selectedDay = null;
  var selectedTime = null;

  for (var i = 0; i < 7; i++) {
    (function (offset) {
      var date = new Date();
      date.setDate(date.getDate() + offset);

      var dayName = DAY_NAMES[date.getDay()];
      var monthName = MONTH_NAMES[date.getMonth()];
      var label = dayName + " " + date.getDate() + " " + monthName;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "tour-day-btn";
      button.setAttribute("aria-label", label);
      button.innerHTML =
        '<span class="tour-day-name"></span>' +
        '<span class="tour-day-num"></span>' +
        '<span class="tour-day-month"></span>';
      button.querySelector(".tour-day-name").textContent = dayName;
      button.querySelector(".tour-day-num").textContent = date.getDate();
      button.querySelector(".tour-day-month").textContent = monthName;

      button.addEventListener("click", function () {
        var wasSelected = button.classList.contains("selected");
        tourDaysContainer.querySelectorAll(".tour-day-btn").forEach(function (other) {
          other.classList.remove("selected");
        });
        if (wasSelected) {
          selectedDay = null;
        } else {
          button.classList.add("selected");
          selectedDay = label;
        }
      });

      tourDaysContainer.appendChild(button);
    })(i);
  }

  tourTimeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var wasSelected = button.classList.contains("selected");
      tourTimeButtons.forEach(function (other) { other.classList.remove("selected"); });
      if (wasSelected) {
        selectedTime = null;
      } else {
        button.classList.add("selected");
        selectedTime = button.getAttribute("data-time");
      }
    });
  });

  /* ---------- Forms ---------- */
  var propertyLabel = property.address + ", " + property.city;

  function wireForm(options) {
    var form = document.getElementById(options.formId);
    var status = document.getElementById(options.statusId);
    var submitBtn = document.getElementById(options.submitId);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var payload = {
        name: document.getElementById(options.nameId).value.trim(),
        phone: document.getElementById(options.phoneId).value.trim(),
        email: document.getElementById(options.emailId).value.trim(),
        property: propertyLabel,
        lead_type: options.leadType,
        preferred_viewing_time: options.getPreferredTime ? options.getPreferredTime() : "",
        sms_consent: document.getElementById(options.consentId).checked
      };

      if (!payload.name || !payload.phone || !payload.email) {
        status.textContent = "Please fill in every field so we can get back to you.";
        status.className = "form-status error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      status.textContent = "";
      status.className = "form-status";

      window.submitEnquiry(payload)
        .then(function () {
          status.textContent = window.SIMPLIFYE_SUCCESS_MESSAGE;
          status.className = "form-status success";
          form.reset();
        })
        .catch(function () {
          status.textContent = window.SIMPLIFYE_ERROR_MESSAGE;
          status.className = "form-status error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = options.submitLabel;
        });
    });
  }

  wireForm({
    formId: "tour-form",
    statusId: "tour-status",
    submitId: "tour-submit",
    nameId: "tour-name",
    phoneId: "tour-phone",
    emailId: "tour-email",
    consentId: "tour-consent",
    leadType: "viewing",
    submitLabel: "Request this tour",
    getPreferredTime: function () {
      return selectedDay && selectedTime ? selectedDay + " · " + selectedTime : "";
    }
  });

  wireForm({
    formId: "question-form",
    statusId: "question-status",
    submitId: "question-submit",
    nameId: "question-name",
    phoneId: "question-phone",
    emailId: "question-email",
    consentId: "question-consent",
    leadType: "question",
    submitLabel: "Send my question"
  });
})();
