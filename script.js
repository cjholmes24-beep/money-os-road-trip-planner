(() => {
  "use strict";

  const form = document.getElementById("tripForm");
  const resetBtn = document.getElementById("resetBtn");
  const errorBox = document.getElementById("formError");

  const ids = ["miles","mpg","fuelPrice","hotelNight","hotelNights","foodPerDay","days","travelers","misc"];
  const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  const output = {
    fuel: document.getElementById("fuelResult"),
    hotel: document.getElementById("hotelResult"),
    food: document.getElementById("foodResult"),
    misc: document.getElementById("miscResult"),
    total: document.getElementById("totalResult"),
    perPerson: document.getElementById("perPersonResult"),
    note: document.getElementById("formulaNote")
  };

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  function value(name, fallback = 0) {
    const raw = fields[name].value.trim();
    if (raw === "") return fallback;
    return Number(raw);
  }

  function clearInvalid() {
    ids.forEach(id => fields[id].removeAttribute("aria-invalid"));
    errorBox.textContent = "";
  }

  function fail(message, field) {
    errorBox.textContent = message;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
    return false;
  }

  function validate() {
    clearInvalid();

    const required = ["miles","mpg","fuelPrice","days","travelers"];
    for (const name of required) {
      if (fields[name].value.trim() === "") {
        return fail("Please complete all required fields.", fields[name]);
      }
    }

    for (const name of ids) {
      if (fields[name].value.trim() === "") continue;
      const n = value(name);
      if (!Number.isFinite(n)) return fail("Enter valid numeric values.", fields[name]);
      if (n < 0) return fail("Costs and distances cannot be negative.", fields[name]);
    }

    if (value("mpg") <= 0) return fail("MPG must be greater than zero.", fields.mpg);
    if (value("days") < 1 || !Number.isInteger(value("days"))) {
      return fail("Travel days must be a whole number of at least 1.", fields.days);
    }
    if (value("travelers") < 1 || !Number.isInteger(value("travelers"))) {
      return fail("Travelers must be a whole number of at least 1.", fields.travelers);
    }
    if (fields.hotelNights.value.trim() !== "" && !Number.isInteger(value("hotelNights"))) {
      return fail("Hotel nights must be a whole number.", fields.hotelNights);
    }
    return true;
  }

  function calculate() {
    if (!validate()) return;

    const miles = value("miles");
    const mpg = value("mpg");
    const fuelPrice = value("fuelPrice");
    const hotelNight = value("hotelNight");
    const hotelNights = value("hotelNights");
    const foodPerDay = value("foodPerDay");
    const days = value("days");
    const travelers = value("travelers");
    const misc = value("misc");

    const fuel = (miles / mpg) * fuelPrice;
    const hotel = hotelNight * hotelNights;
    const food = foodPerDay * days * travelers;
    const total = fuel + hotel + food + misc;
    const perPerson = total / travelers;

    output.fuel.textContent = money.format(fuel);
    output.hotel.textContent = money.format(hotel);
    output.food.textContent = money.format(food);
    output.misc.textContent = money.format(misc);
    output.total.textContent = money.format(total);
    output.perPerson.textContent = money.format(perPerson);
    output.note.textContent =
      `Fuel uses ${miles.toLocaleString()} miles ÷ ${mpg.toLocaleString()} MPG × ${money.format(fuelPrice)} per gallon.`;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    calculate();
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    clearInvalid();
    ["fuel","hotel","food","misc","total","perPerson"].forEach(key => {
      output[key].textContent = "$0.00";
    });
    output.note.textContent = "Fuel = (trip miles ÷ MPG) × fuel price.";
    fields.miles.focus();
  });
})();