(() => {
  "use strict";
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const navButton = document.querySelector(".nav-toggle");
  if (navButton) navButton.addEventListener("click", () => {
    const open = navButton.getAttribute("aria-expanded") === "true";
    navButton.setAttribute("aria-expanded", String(!open));
    document.getElementById("tool-nav").classList.toggle("open", !open);
  });
  const form = document.querySelector("form[data-calculator]");
  if (!form) return;
  const error = form.querySelector(".error");
  const $ = id => document.getElementById(id);
  const val = id => Number($(id).value);
  const setMoney = (id, value) => { $(id).textContent = money.format(value); };
  function validate() {
    error.textContent = "";
    const inputs = [...form.querySelectorAll('input[type="number"]')];
    inputs.forEach(input => input.removeAttribute("aria-invalid"));
    for (const input of inputs) {
      const raw = input.value.trim();
      if (input.required && raw === "") return fail(input, "Complete all required fields.");
      if (raw !== "" && (!Number.isFinite(Number(raw)) || Number(raw) < Number(input.min || 0))) return fail(input, "Enter valid values at or above the stated minimum.");
      if (raw !== "" && input.step === "1" && !Number.isInteger(Number(raw))) return fail(input, "Use whole numbers for travelers, days, or bags.");
    }
    return true;
  }
  function fail(input, message) { error.textContent = message; input.setAttribute("aria-invalid", "true"); input.focus(); return false; }
  const calculators = {
    gas() { const miles=val("miles")*($("roundTrip").checked?2:1), gallons=miles/val("mpg"); $("gallonsResult").textContent=`${number.format(gallons)} gal`; setMoney("fuelCostResult",gallons*val("fuelPrice")); },
    road() { const fuel=val("miles")/val("mpg")*val("fuelPrice"), food=val("foodDaily")*val("travelers")*val("days"), values={fuelResult:fuel,lodgingResult:val("lodging"),foodResult:food,tollsResult:val("tolls"),parkingResult:val("parking"),miscResult:val("misc")}; Object.entries(values).forEach(([id,v])=>setMoney(id,v)); const total=Object.values(values).reduce((a,b)=>a+b,0); setMoney("totalResult",total); setMoney("perPersonResult",total/val("travelers")); },
    rental() { const base=val("dailyRate")*val("days"), ground=val("parking")+val("tolls"); setMoney("baseResult",base); setMoney("feesResult",val("fees")); setMoney("fuelResult",val("fuel")); setMoney("groundResult",ground); setMoney("totalResult",base+val("fees")+val("fuel")+ground); },
    transfer() { const journeys=Number($("tripType").value), total=val("oneWayCost")*journeys; $("journeysResult").textContent=journeys===1?"1 one-way transfer":"2 one-way transfers"; setMoney("totalResult",total); setMoney("perPersonResult",total/val("travelers")); },
    esim() { const data=val("days")*val("dailyData"); $("dataResult").textContent=`${number.format(data)} GB`; setMoney("budgetResult",data*val("pricePerGb")); },
    activities() { const tickets=val("travelers")*val("perDay")*val("days"), total=tickets*val("averageCost"); $("ticketsResult").textContent=number.format(tickets); setMoney("totalResult",total); setMoney("perPersonResult",total/val("travelers")); },
    luggage() { const units=val("bags")*val("duration"); $("bagUnitsResult").textContent=`${number.format(units)} bag-${$("unit").value}${units===1?"":"s"}`; setMoney("totalResult",units*val("rate")); }
  };
  form.addEventListener("submit", event => { event.preventDefault(); if (validate()) calculators[form.dataset.calculator](); });
  document.querySelector(".reset").addEventListener("click", () => { form.reset(); error.textContent=""; form.querySelectorAll('[aria-invalid="true"]').forEach(e=>e.removeAttribute("aria-invalid")); document.querySelectorAll(".result-grid strong").forEach(e=>e.textContent=e.id.includes("Result")?"$0.00":"0"); form.querySelector("input").focus(); });
})();
