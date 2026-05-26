export function bookingDateRendererScript(): string {
  return `
function renderDates() {
  if (!allSlots.length) {
    datesContainer.innerHTML = \`
      <div class="no-times">
        \${iconCalendar(40)}
        <br />
        Sin disponibilidad en este momento.<br>Intenta más tarde.
      </div>
    \`;
    return;
  }

  const today = todayStr();
  const scroll = document.createElement("div");

  scroll.className = "dates-scroll";

  allSlots.forEach(({ date, times }) => {
    if (!times || !times.length) return;

    const d = parseDateLocal(date);
    const chip = document.createElement("div");

    chip.className =
      "date-chip" +
      (date === selDate ? " selected" : "") +
      (date === today ? " today" : "");

    chip.innerHTML = \`
      <span class="date-chip-dow">\${DOW[d.getDay()]}</span>
      <span class="date-chip-day">\${d.getDate()}</span>
      <span class="date-chip-mon">\${MON[d.getMonth()]}</span>
    \`;

    chip.addEventListener("click", () => selectDate(date));

    scroll.appendChild(chip);
  });

  datesContainer.innerHTML = "";
  datesContainer.appendChild(scroll);
}

function selectDate(date) {
  selDate = date;
  selTime = null;

  renderDates();
  renderTimes(date);
  goToStep(2);
}
`;
}