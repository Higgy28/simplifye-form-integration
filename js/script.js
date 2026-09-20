(function () {
  var properties = window.SIMPLIFYE_PROPERTIES || [];

  var grid = document.getElementById("listings-grid");
  var chipsContainer = document.getElementById("area-chips");
  var resultsCount = document.getElementById("results-count");
  var noResults = document.getElementById("no-results");
  var sortSelect = document.getElementById("sort-select");
  var searchBar = document.getElementById("search-bar");
  var areaSelect = document.getElementById("search-area");
  var priceSelect = document.getElementById("search-price");
  var bedsSelect = document.getElementById("search-beds");
  var typeSelect = document.getElementById("search-type");

  var activeCity = "All";

  function formatPrice(value) {
    return "£" + value.toLocaleString("en-GB") + " pcm";
  }

  function uniqueSorted(values) {
    return values.filter(function (value, index) {
      return values.indexOf(value) === index;
    }).sort();
  }

  var cities = uniqueSorted(properties.map(function (p) { return p.city; }));
  var types = uniqueSorted(properties.map(function (p) { return p.type; }));

  // Populate the hero search dropdowns from the data itself.
  cities.forEach(function (city) {
    var option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    areaSelect.appendChild(option);
  });
  types.forEach(function (type) {
    var option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });

  function buildChips() {
    ["All"].concat(cities).forEach(function (city) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (city === activeCity ? " chip-active" : "");
      chip.textContent = city;
      chip.addEventListener("click", function () {
        activeCity = city;
        areaSelect.value = city === "All" ? "" : city;
        chipsContainer.querySelectorAll(".chip").forEach(function (other) {
          other.classList.remove("chip-active");
        });
        chip.classList.add("chip-active");
        render();
      });
      chipsContainer.appendChild(chip);
    });
  }

  function getFiltered() {
    var maxPrice = priceSelect.value ? parseInt(priceSelect.value, 10) : null;
    var minBeds = bedsSelect.value ? parseInt(bedsSelect.value, 10) : null;
    var type = typeSelect.value;

    var filtered = properties.filter(function (p) {
      if (activeCity !== "All" && p.city !== activeCity) return false;
      if (maxPrice !== null && p.price > maxPrice) return false;
      if (minBeds !== null && p.beds < minBeds) return false;
      if (type && p.type !== type) return false;
      return true;
    });

    var sort = sortSelect.value;
    if (sort === "price-asc") {
      filtered.sort(function (a, b) { return a.price - b.price; });
    } else if (sort === "price-desc") {
      filtered.sort(function (a, b) { return b.price - a.price; });
    } else if (sort === "recent") {
      filtered.sort(function (a, b) { return a.listed < b.listed ? 1 : -1; });
    }

    return filtered;
  }

  function buildCard(property) {
    var card = document.createElement("a");
    card.className = "listing-card";
    card.href = "listing.html?id=" + encodeURIComponent(property.id);
    card.setAttribute(
      "aria-label",
      property.address + ", " + property.city + ", " + formatPrice(property.price)
    );

    card.innerHTML =
      '<div class="card-media">' +
        '<img alt="" loading="lazy">' +
        '<span class="listing-badge" hidden></span>' +
        '<span class="card-photo-count">' +
          '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8h3l2-2h8l2 2h3v12H3z"/><circle cx="12" cy="13" r="3.4"/></svg>' +
          '<span class="photo-count-value"></span>' +
        "</span>" +
      "</div>" +
      '<div class="card-body">' +
        '<p class="card-price"></p>' +
        '<p class="card-specs"></p>' +
        '<p class="card-address"></p>' +
        '<p class="card-area"></p>' +
      "</div>";

    var image = card.querySelector("img");
    image.src = property.images[0];

    var badge = card.querySelector(".listing-badge");
    if (property.badge) {
      badge.textContent = property.badge;
      badge.setAttribute("data-badge", property.badge);
      badge.hidden = false;
    }

    card.querySelector(".photo-count-value").textContent = property.images.length;
    card.querySelector(".card-price").textContent = formatPrice(property.price);
    card.querySelector(".card-specs").innerHTML =
      "<strong>" + property.beds + "</strong> bed &nbsp;<strong>" + property.baths +
      "</strong> bath &nbsp;<strong>" + property.sqft.toLocaleString("en-GB") +
      "</strong> sqft &nbsp;" + property.type;
    card.querySelector(".card-address").textContent = property.address;
    card.querySelector(".card-area").textContent = property.area + ", " + property.city;

    return card;
  }

  function render() {
    var filtered = getFiltered();

    grid.innerHTML = "";
    filtered.forEach(function (property) {
      grid.appendChild(buildCard(property));
    });

    var where = activeCity === "All" ? "across the UK" : "in " + activeCity;
    resultsCount.innerHTML =
      "<strong>" + filtered.length + (filtered.length === 1 ? " home</strong> to let " : " homes</strong> to let ") + where;

    noResults.hidden = filtered.length > 0;
  }

  searchBar.addEventListener("submit", function (event) {
    event.preventDefault();
    activeCity = areaSelect.value || "All";
    chipsContainer.querySelectorAll(".chip").forEach(function (chip) {
      chip.classList.toggle("chip-active", chip.textContent === activeCity);
    });
    render();
    document.getElementById("homes").scrollIntoView({ behavior: "smooth" });
  });

  sortSelect.addEventListener("change", render);

  buildChips();
  render();
})();

(function () {
  var form = document.getElementById("enquiry-form");
  var status = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      property: document.getElementById("property").value.trim(),
      lead_type: document.getElementById("lead-type").value,
      preferred_viewing_time: document.getElementById("preferred-viewing").value.trim(),
      sms_consent: document.getElementById("sms-consent").checked
    };

    if (!payload.lead_type || !payload.name || !payload.phone || !payload.email || !payload.property) {
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
        submitBtn.textContent = "Send my enquiry";
      });
  });
})();
