// 0 = zondag … 6 = zaterdag. null = gesloten. (Google Maps, okt 2026)
const HOURS = {
  0: null, 1: ["09:00", "19:00"], 2: ["09:00", "19:00"], 3: ["09:00", "19:00"],
  4: ["09:00", "19:00"], 5: ["09:00", "20:00"], 6: ["09:00", "20:00"],
};
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · vandaag vanaf ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten · ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} vanaf ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const k = document.querySelector("[data-status]");
  k.classList.toggle("is-open", isOpen);
  k.textContent = isOpen ? `Nu open tot ${today[1]} — Diestsestraat 204` : "Diestsestraat 204 — Leuven";
}
renderHours();
setInterval(renderHours, 60_000);

// Nav
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// Reveal
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 120}ms`;
  io.observe(el);
});

// Galerij: verticaal scrollwiel → horizontaal op desktop
const strip = document.querySelector(".strip");
strip.addEventListener("wheel", e => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const max = strip.scrollWidth - strip.clientWidth;
  if ((e.deltaY > 0 && strip.scrollLeft < max) || (e.deltaY < 0 && strip.scrollLeft > 0)) {
    e.preventDefault();
    strip.scrollLeft += e.deltaY;
  }
}, { passive: false });

document.getElementById("year").textContent = new Date().getFullYear();
