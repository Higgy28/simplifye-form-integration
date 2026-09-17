(function () {
  var ENDPOINT_URL =
    "https://script.google.com/macros/s/AKfycbz4sKxOS8UxZfr7YxxeBNe2E00giRlNSCbBV07-bx6SqO1Z_DfdxBRSurvpqEU8XuHEqg/exec";

  var form = document.getElementById("enquiry-form");
  var status = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var leadType = document.getElementById("lead-type").value;
    var name = document.getElementById("name").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var property = document.getElementById("property").value.trim();
    var preferredViewing = document.getElementById("preferred-viewing").value.trim();

    if (!leadType || !name || !phone || !property) {
      status.textContent = "Please fill in every field so we can get back to you.";
      status.className = "form-status error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    status.textContent = "";
    status.className = "form-status";

    var payload = {
      name: name,
      phone: phone,
      property: property,
      lead_type: leadType,
      preferred_viewing_time: preferredViewing
    };

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

(function () {
  var properties = [
    {
      address: "20 Elm Street, Glasgow",
      price: "£950 pcm",
      beds: 2,
      baths: 1,
      type: "Flat",
      availableFrom: "1 October 2026",
      shortDesc: "A bright two-bedroom flat moments from the West End's cafes and transport links.",
      fullDesc: "This bright, top-floor two-bedroom flat sits on a quiet residential street just a short walk from the West End's cafes, shops and transport links. It's been recently redecorated throughout and comes with a modern kitchen and a private garden space to the rear, making it an easy, comfortable base for professionals or sharers."
    },
    {
      address: "14 Oak Avenue, Edinburgh",
      price: "£1,250 pcm",
      beds: 3,
      baths: 2,
      type: "Terraced house",
      availableFrom: "15 October 2026",
      shortDesc: "A spacious three-bedroom family home with a private garden and driveway.",
      fullDesc: "This spacious three-bedroom terraced home offers generous family living across two floors, with a private rear garden and off-street driveway parking. It's within easy reach of local schools and regular bus routes into the city centre, and the open-plan kitchen-diner makes it a natural fit for family life."
    },
    {
      address: "8 Willow Court, Manchester",
      price: "£825 pcm",
      beds: 1,
      baths: 1,
      type: "Apartment",
      availableFrom: "Now",
      shortDesc: "A modern one-bedroom apartment ready to move into straight away.",
      fullDesc: "This modern one-bedroom apartment is available to move into straight away, with an open-plan living space, contemporary fittings and secure entry. It's ideally placed for the city centre and nearby transport links, making it a great option for a single professional or couple."
    }
  ];

  var grid = document.getElementById("properties-grid");
  var modal = document.getElementById("property-modal");
  var modalClose = document.getElementById("modal-close");
  var modalEnquireBtn = document.getElementById("modal-enquire");
  var modalAddress = document.getElementById("modal-address");
  var modalPrice = document.getElementById("modal-price");
  var modalDesc = document.getElementById("modal-desc");
  var modalBeds = document.getElementById("modal-beds");
  var modalBaths = document.getElementById("modal-baths");
  var modalType = document.getElementById("modal-type");
  var modalAvailable = document.getElementById("modal-available");
  var tourDaysContainer = document.getElementById("tour-days");
  var tourTimeButtons = document.querySelectorAll(".tour-time-btn");
  var currentProperty = null;
  var selectedTourDay = null;
  var selectedTourTime = null;

  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (var i = 0; i < 7; i++) {
    (function (offset) {
      var date = new Date();
      date.setDate(date.getDate() + offset);

      var dayName = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : DAY_NAMES[date.getDay()];
      var fullLabel = offset === 0 || offset === 1
        ? DAY_NAMES[date.getDay()] + " " + date.getDate()
        : dayName + " " + date.getDate();

      var dayBtn = document.createElement("button");
      dayBtn.type = "button";
      dayBtn.className = "tour-day-btn";
      dayBtn.innerHTML =
        '<span class="tour-day-name"></span><span class="tour-day-num"></span>';
      dayBtn.querySelector(".tour-day-name").textContent = dayName;
      dayBtn.querySelector(".tour-day-num").textContent = date.getDate();
      dayBtn.setAttribute("aria-label", fullLabel);

      dayBtn.addEventListener("click", function () {
        var alreadySelected = dayBtn.classList.contains("selected");
        tourDaysContainer.querySelectorAll(".tour-day-btn").forEach(function (btn) {
          btn.classList.remove("selected");
        });
        if (alreadySelected) {
          selectedTourDay = null;
        } else {
          dayBtn.classList.add("selected");
          selectedTourDay = fullLabel;
        }
      });

      tourDaysContainer.appendChild(dayBtn);
    })(i);
  }

  tourTimeButtons.forEach(function (timeBtn) {
    timeBtn.addEventListener("click", function () {
      var alreadySelected = timeBtn.classList.contains("selected");
      tourTimeButtons.forEach(function (btn) { btn.classList.remove("selected"); });
      if (alreadySelected) {
        selectedTourTime = null;
      } else {
        timeBtn.classList.add("selected");
        selectedTourTime = timeBtn.getAttribute("data-time");
      }
    });
  });

  function resetTourSelection() {
    selectedTourDay = null;
    selectedTourTime = null;
    tourDaysContainer.querySelectorAll(".tour-day-btn").forEach(function (btn) {
      btn.classList.remove("selected");
    });
    tourTimeButtons.forEach(function (btn) { btn.classList.remove("selected"); });
  }

  function openPropertyModal(property) {
    currentProperty = property;
    modalAddress.textContent = property.address;
    modalPrice.textContent = property.price;
    modalDesc.textContent = property.fullDesc;
    modalBeds.textContent = property.beds;
    modalBaths.textContent = property.baths;
    modalType.textContent = property.type;
    modalAvailable.textContent = property.availableFrom;
    resetTourSelection();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalClose.focus();
  }

  function closePropertyModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    currentProperty = null;
  }

  properties.forEach(function (property) {
    var card = document.createElement("div");
    card.className = "property-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "View details for " + property.address + ", " + property.price);

    card.innerHTML =
      '<div class="property-image" aria-hidden="true">' +
        "<span>🏠</span>" +
        '<span class="property-image-label">Photo placeholder</span>' +
      "</div>" +
      '<div class="property-body">' +
        '<p class="property-address"></p>' +
        '<p class="property-price"></p>' +
        '<p class="property-meta"></p>' +
        '<p class="property-desc"></p>' +
      "</div>";

    card.querySelector(".property-address").textContent = property.address;
    card.querySelector(".property-price").textContent = property.price;
    card.querySelector(".property-meta").textContent =
      property.beds + " bed · " + property.baths + " bath · " + property.type;
    card.querySelector(".property-desc").textContent = property.shortDesc;

    card.addEventListener("click", function () {
      openPropertyModal(property);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPropertyModal(property);
      }
    });

    grid.appendChild(card);
  });

  modalClose.addEventListener("click", closePropertyModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closePropertyModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closePropertyModal();
  });

  modalEnquireBtn.addEventListener("click", function () {
    if (!currentProperty) return;
    document.getElementById("property").value = currentProperty.address;
    document.getElementById("lead-type").value = "viewing";
    document.getElementById("preferred-viewing").value =
      selectedTourDay && selectedTourTime ? selectedTourDay + " · " + selectedTourTime : "";
    closePropertyModal();
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
})();
