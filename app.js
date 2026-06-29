const STORAGE_KEY = "villa_manager_pro_2026_v1";
const APARTMENTS = ["Appartement 1 étage", "Appartement 2 étage"];
const SEASON_START = "2026-06-01";
const SEASON_END = "2026-10-31";

const SEED_BOOKINGS = [
  {
    name: "Tata Dounia",
    phone: "+213 698 79 97 36",
    apartment: "Appartement 1 étage",
    start: "2026-06-09",
    end: "2026-06-11",
    total: null,
    paid: null
  },
  {
    name: "Khaletha (Alger)",
    phone: "0557179525",
    apartment: "Appartement 1 étage",
    start: "2026-07-15",
    end: "2026-07-25",
    total: null,
    paid: 5000
  },
  {
    name: "Ahmed Constantine",
    phone: "0698950584",
    apartment: "Appartement 2 étage",
    start: "2026-07-08",
    end: "2026-07-15",
    total: null,
    paid: 2000
  },
  {
    name: "Alger",
    phone: "0557179525",
    apartment: "Appartement 2 étage",
    start: "2026-07-15",
    end: "2026-07-25",
    total: null,
    paid: 6000
  },
  {
    name: "Selma",
    phone: "0778273344",
    apartment: "Appartement 2 étage",
    start: "2026-07-25",
    end: "2026-08-03",
    total: null,
    paid: 6000
  },
  {
    name: "Alger",
    phone: "0781718919",
    apartment: "Appartement 2 étage",
    start: "2026-08-05",
    end: "2026-08-14",
    total: null,
    paid: 6000
  },
  {
    name: "Oued Souf",
    phone: "+213 671 89 85 08",
    apartment: "Appartement 2 étage",
    start: "2026-08-16",
    end: "2026-08-23",
    total: null,
    paid: 6000
  }
];

const form = document.getElementById("bookingForm");
const clientNameInput = document.getElementById("clientName");
const clientPhoneInput = document.getElementById("clientPhone");
const apartmentSelect = document.getElementById("apartment");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const totalAmountInput = document.getElementById("totalAmount");
const paidAmountInput = document.getElementById("paidAmount");
const remainingPreview = document.getElementById("remainingPreview");
const clearFormBtn = document.getElementById("clearFormBtn");
const apartmentTabs = document.getElementById("apartmentTabs");
const statsGrid = document.getElementById("statsGrid");
const alertPanel = document.getElementById("alertPanel");
const calendarMonths = document.getElementById("calendarMonths");
const bookingsTableBody = document.getElementById("bookingsTableBody");
const selectedApartmentLabel = document.getElementById("selectedApartmentLabel");
const calendarApartmentTitle = document.getElementById("calendarApartmentTitle");
const toastContainer = document.getElementById("toastContainer");

let selectedApartment = APARTMENTS[0];
let bookings = loadBookings();

init();

function init() {
  startDateInput.min = SEASON_START;
  startDateInput.max = SEASON_END;
  endDateInput.min = SEASON_START;
  endDateInput.max = SEASON_END;
  apartmentSelect.value = selectedApartment;

  renderAll();
  updateRemainingPreview();

  form.addEventListener("submit", onSubmitBooking);
  clearFormBtn.addEventListener("click", clearForm);

  [totalAmountInput, paidAmountInput].forEach((input) => {
    input.addEventListener("input", updateRemainingPreview);
  });

  apartmentTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    selectedApartment = btn.dataset.apartment;
    apartmentSelect.value = selectedApartment;
    updateActiveTab();
    renderAll();
  });

  bookingsTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const bookingId = btn.dataset.id;
    removeBooking(bookingId);
  });
}

function loadBookings() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seeded = SEED_BOOKINGS.map((booking) => ({
      id: generateId(),
      ...booking
    }));
    saveBookings(seeded);
    return sortBookings(seeded);
  }

  try {
    const parsed = JSON.parse(stored);
    const cleaned = parsed.map((booking) => ({
      id: booking.id || generateId(),
      name: booking.name || "",
      phone: booking.phone || "",
      apartment: booking.apartment || APARTMENTS[0],
      start: booking.start || "",
      end: booking.end || "",
      total: normalizeNumber(booking.total),
      paid: normalizeNumber(booking.paid)
    }));
    return sortBookings(cleaned);
  } catch (error) {
    const seeded = SEED_BOOKINGS.map((booking) => ({
      id: generateId(),
      ...booking
    }));
    saveBookings(seeded);
    return sortBookings(seeded);
  }
}

function saveBookings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function sortBookings(data) {
  return [...data].sort((a, b) => {
    if (a.apartment !== b.apartment) {
      return a.apartment.localeCompare(b.apartment);
    }
    return parseDate(a.start) - parseDate(b.start);
  });
}

function generateId() {
  return "b_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `${new Intl.NumberFormat("fr-FR").format(value)} DA`;
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function diffDaysInclusive(start, end) {
  const diff = parseDate(end) - parseDate(start);
  return Math.floor(diff / 86400000) + 1;
}

function addDays(date, number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + number);
  return clone;
}

function formatToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getRemaining(total, paid) {
  if (total === null || total === undefined) return null;
  const paidValue = paid === null || paid === undefined ? 0 : paid;
  return total - paidValue;
}

function getApartmentClass(apartment) {
  return apartment === "Appartement 1 étage" ? "badge-apt1" : "badge-apt2";
}

function updateActiveTab() {
  const buttons = apartmentTabs.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.apartment === selectedApartment);
  });
}

function updateRemainingPreview() {
  const total = normalizeNumber(totalAmountInput.value);
  const paid = normalizeNumber(paidAmountInput.value);

  if (total === null) {
    remainingPreview.textContent = "-";
    return;
  }

  const rest = total - (paid || 0);
  remainingPreview.textContent = `${new Intl.NumberFormat("fr-FR").format(rest)} DA`;
}

function clearForm() {
  form.reset();
  apartmentSelect.value = selectedApartment;
  startDateInput.min = SEASON_START;
  startDateInput.max = SEASON_END;
  endDateInput.min = SEASON_START;
  endDateInput.max = SEASON_END;
  remainingPreview.textContent = "-";
}

function onSubmitBooking(e) {
  e.preventDefault();

  const booking = {
    id: generateId(),
    name: clientNameInput.value.trim(),
    phone: clientPhoneInput.value.trim(),
    apartment: apartmentSelect.value,
    start: startDateInput.value,
    end: endDateInput.value,
    total: normalizeNumber(totalAmountInput.value),
    paid: normalizeNumber(paidAmountInput.value)
  };

  const validationErrors = validateBooking(booking);

  if (validationErrors.length > 0) {
    validationErrors.forEach((msg) => showToast(msg, "error"));
    return;
  }

  bookings.push(booking);
  bookings = sortBookings(bookings);
  saveBookings(bookings);

  showToast("✅ Réservation ajoutée avec succès.", "success");

  clearForm();
  renderAll();
}

function validateBooking(booking) {
  const errors = [];

  if (!booking.name) {
    errors.push("❌ Le nom du client est obligatoire.");
  }

  if (!booking.apartment) {
    errors.push("❌ L’appartement est obligatoire.");
  }

  if (!booking.start || !booking.end) {
    errors.push("❌ Les dates d’entrée et de sortie sont obligatoires.");
    return errors;
  }

  const seasonStart = parseDate(SEASON_START);
  const seasonEnd = parseDate(SEASON_END);
  const start = parseDate(booking.start);
  const end = parseDate(booking.end);

  if (start > end) {
    errors.push("❌ Date invalide : la date de sortie doit être après la date d’entrée.");
  }

  if (start < seasonStart || end > seasonEnd) {
    errors.push("❌ Réservation refusée : les dates doivent rester entre Juin et Octobre 2026.");
  }

  if (booking.total !== null && booking.total < 0) {
    errors.push("❌ Le montant total ne peut pas être négatif.");
  }

  if (booking.paid !== null && booking.paid < 0) {
    errors.push("❌ Le montant payé ne peut pas être négatif.");
  }

  if (
    booking.total !== null &&
    booking.paid !== null &&
    booking.paid > booking.total
  ) {
    errors.push("❌ Le montant payé ne peut pas dépasser le montant total.");
  }

  if (hasConflict(booking)) {
    errors.push("❌ Conflit détecté : ces dates sont déjà réservées dans le même appartement.");
  }

  return errors;
}

/*
  Règle importante :
  - Le système accepte qu'un client sorte le même jour où un autre entre.
  - Donc : si nouvelle entrée = ancienne sortie, c'est autorisé.
  - On bloque seulement le vrai chevauchement.
*/
function hasConflict(newBooking) {
  const newStart = parseDate(newBooking.start);
  const newEnd = parseDate(newBooking.end);

  return bookings.some((existing) => {
    if (existing.apartment !== newBooking.apartment) return false;

    const existingStart = parseDate(existing.start);
    const existingEnd = parseDate(existing.end);

    return newStart < existingEnd && newEnd > existingStart;
  });
}

function removeBooking(bookingId) {
  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) return;

  bookings = bookings.filter((item) => item.id !== bookingId);
  saveBookings(bookings);

  showToast(`🗑 Réservation supprimée : ${booking.name}`, "info");
  renderAll();
}

function renderAll() {
  updateActiveTab();
  renderStats();
  renderAlertPanel();
  renderCalendar();
  renderTable();
  selectedApartmentLabel.textContent = selectedApartment;
  calendarApartmentTitle.textContent = selectedApartment;
}

function renderStats() {
  const selectedBookings = bookings.filter(
    (booking) => booking.apartment === selectedApartment
  );

  const totalBookings = selectedBookings.length;
  const totalPaid = selectedBookings.reduce((sum, booking) => {
    return sum + (booking.paid || 0);
  }, 0);

  const bookedDays = selectedBookings.reduce((sum, booking) => {
    return sum + diffDaysInclusive(booking.start, booking.end);
  }, 0);

  const today = formatToISO(new Date());
  const nextBooking = selectedBookings
    .filter((booking) => booking.start >= today)
    .sort((a, b) => parseDate(a.start) - parseDate(b.start))[0];

  const nextBookingText = nextBooking
    ? `${nextBooking.name} · ${formatDate(nextBooking.start)}`
    : "Aucune réservation à venir";

  const stats = [
    {
      label: "Réservations",
      value: totalBookings,
      sub: "dans l’appartement sélectionné"
    },
    {
      label: "Jours réservés",
      value: bookedDays,
      sub: "selon les réservations enregistrées"
    },
    {
      label: "Montants payés",
      value: formatMoney(totalPaid),
      sub: "somme des versements"
    },
    {
      label: "Prochaine entrée",
      value: nextBooking ? formatDate(nextBooking.start) : "-",
      sub: nextBookingText
    }
  ];

  statsGrid.innerHTML = stats
    .map(
      (stat) => `
      <div class="stat-box">
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-sub">${stat.sub}</div>
      </div>
    `
    )
    .join("");
}

function renderAlertPanel() {
  const today = formatToISO(new Date());
  const tomorrow = formatToISO(addDays(new Date(), 1));
  const cards = [];

  bookings.forEach((booking) => {
    if (booking.start === today) {
      cards.push({
        type: "info",
        title: "Entrée aujourd’hui",
        desc: `${booking.name} · ${booking.apartment} · ${formatDate(booking.start)}`
      });
    }

    if (booking.end === today) {
      cards.push({
        type: "success",
        title: "Sortie aujourd’hui",
        desc: `${booking.name} · ${booking.apartment} · ${formatDate(booking.end)}`
      });
    }

    if (booking.start === tomorrow) {
      cards.push({
        type: "warning",
        title: "Entrée demain",
        desc: `${booking.name} · ${booking.apartment} · ${formatDate(booking.start)}`
      });
    }

    const remaining = getRemaining(booking.total, booking.paid);
    if (remaining !== null && remaining > 0) {
      cards.push({
        type: "warning",
        title: "Paiement incomplet",
        desc: `${booking.name} · reste ${formatMoney(remaining)} · ${booking.apartment}`
      });
    }
  });

  if (cards.length === 0) {
    cards.push({
      type: "neutral",
      title: "Aucune alerte urgente",
      desc: "Pas d’entrée, pas de sortie, et aucun paiement restant à signaler pour le moment."
    });
  }

  alertPanel.innerHTML = cards
    .map(
      (card) => `
      <div class="alert-card ${card.type}">
        <div class="title">${card.title}</div>
        <div class="desc">${card.desc}</div>
      </div>
    `
    )
    .join("");
}

function renderCalendar() {
  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
  const months = [
    { name: "Juin 2026", year: 2026, month: 5 },
    { name: "Juillet 2026", year: 2026, month: 6 },
    { name: "Août 2026", year: 2026, month: 7 },
    { name: "Septembre 2026", year: 2026, month: 8 },
    { name: "Octobre 2026", year: 2026, month: 9 }
  ];

  const apartmentBookings = bookings.filter(
    (booking) => booking.apartment === selectedApartment
  );

  calendarMonths.innerHTML = months
    .map(({ name, year, month }) => {
      const firstDay = new Date(year, month, 1);
      const lastDate = new Date(year, month + 1, 0).getDate();

      // Monday first
      const offset = (firstDay.getDay() + 6) % 7;

      let placeholders = "";
      for (let i = 0; i < offset; i++) {
        placeholders += `<div class="day-placeholder"></div>`;
      }

      let daysMarkup = "";

      for (let day = 1; day <= lastDate; day++) {
        const dateObj = new Date(year, month, day, 12, 0, 0);
        const dateStr = formatToISO(dateObj);
        const todayStr = formatToISO(new Date());

        const checkIns = apartmentBookings.filter((booking) => booking.start === dateStr);
        const checkOuts = apartmentBookings.filter((booking) => booking.end === dateStr);
        const occupied = apartmentBookings.filter((booking) => {
          return dateStr > booking.start && dateStr < booking.end;
        });

        let dayClass = "day-empty";
        let label = "Libre";

        if (checkIns.length && checkOuts.length) {
          dayClass = "day-turnover";
          label = "Sortie + Entrée";
        } else if (checkIns.length) {
          dayClass = "day-checkin";
          label = `Entrée · ${extractShortName(checkIns[0].name)}`;
        } else if (checkOuts.length) {
          dayClass = "day-checkout";
          label = `Sortie · ${extractShortName(checkOuts[0].name)}`;
        } else if (occupied.length) {
          dayClass = "day-occupied";
          label = occupied.length > 1 ? "Occupé" : `Occupé · ${extractShortName(occupied[0].name)}`;
        }

        const tooltipBookings = apartmentBookings.filter((booking) => {
          return dateStr >= booking.start && dateStr <= booking.end;
        });

        const title = tooltipBookings.length
          ? tooltipBookings
              .map((booking) => {
                return `${booking.name} | ${formatDate(booking.start)} → ${formatDate(booking.end)}`;
              })
              .join("\n")
          : "Jour libre";

        const todayClass = dateStr === todayStr ? "day-today" : "";

        daysMarkup += `
          <div class="day-cell ${dayClass} ${todayClass}" title="${escapeHtml(title)}">
            <div class="day-number">${day}</div>
            <div class="day-label">${label}</div>
          </div>
        `;
      }

      return `
        <div class="month-card">
          <h3 class="month-title">${name}</h3>
          <div class="weekdays">
            ${weekdays.map((wd) => `<div class="weekday">${wd}</div>`).join("")}
          </div>
          <div class="days-grid">
            ${placeholders}
            ${daysMarkup}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTable() {
  if (bookings.length === 0) {
    bookingsTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-row">Aucune réservation enregistrée.</td>
      </tr>
    `;
    return;
  }

  bookingsTableBody.innerHTML = sortBookings(bookings)
    .map((booking) => {
      const days = diffDaysInclusive(booking.start, booking.end);
      const remaining = getRemaining(booking.total, booking.paid);

      return `
        <tr>
          <td>${escapeHtml(booking.name)}</td>
          <td>${booking.phone ? escapeHtml(booking.phone) : "-"}</td>
          <td>
            <span class="apartment-badge ${getApartmentClass(booking.apartment)}">
              ${booking.apartment}
            </span>
          </td>
          <td>${formatDate(booking.start)}</td>
          <td>${formatDate(booking.end)}</td>
          <td>${days}</td>
          <td>${formatMoney(booking.total)}</td>
          <td>${formatMoney(booking.paid)}</td>
          <td>${remaining === null ? "-" : formatMoney(remaining)}</td>
          <td>
            <button class="delete-btn" data-id="${booking.id}" title="Supprimer">🗑</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function extractShortName(name) {
  if (!name) return "Réservé";
  const first = name.trim().split(" ")[0];
  return first.length > 12 ? first.slice(0, 12) + "…" : first;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4200);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}