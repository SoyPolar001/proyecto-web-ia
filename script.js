const API_URL = "https://rickandmortyapi.com/api/character";
const FAVORITES_KEY = "atlas-rm-favorites";
const THEME_KEY = "atlas-rm-theme";
const $ = (selector) => document.querySelector(selector);
const grid = $("#characterGrid");
const searchForm = $("#searchForm");
const searchInput = $("#searchInput");
const statusFilter = $("#statusFilter");
const speciesFilter = $("#speciesFilter");
const sortFilter = $("#sortFilter");
const favoritesToggle = $("#favoritesToggle");
const themeToggle = $("#themeToggle");
const previousButton = $("#prevPage");
const nextButton = $("#nextPage");
let page = 1;
let pages = 1;
let searchName = "";
let favoritesOnly = false;
let requestId = 0;
let characters = [];
let favorites = readSaved(FAVORITES_KEY, []);

function readSaved(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch { return fallback; }
}

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character]);
}

function updateFavoriteCount() {
  $("#favoriteCount").textContent = favorites.length;
  $("#favoriteButtonCount").textContent = favorites.length;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeToggle.innerHTML = dark
    ? '<span aria-hidden="true">☀</span><span>Modo claro</span>'
    : '<span aria-hidden="true">☾</span><span>Modo oscuro</span>';
  themeToggle.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  try { localStorage.setItem(THEME_KEY, theme); } catch (error) { console.warn(error); }
}

function updateFilterSummary() {
  const filters = [];
  if (searchName) filters.push("nombre: " + searchName);
  if (statusFilter.value) filters.push("estado: " + statusFilter.selectedOptions[0].text);
  if (speciesFilter.value) filters.push("especie: " + speciesFilter.selectedOptions[0].text);
  if (sortFilter.value === "az") filters.push("orden: A-Z");
  $("#activeFilters").textContent = filters.length ? filters.join(" · ") : favoritesOnly ? "Tu selección guardada" : "Mostrando personajes del universo";
}

function renderCard(character) {
  const saved = favorites.some((item) => item.id === character.id);
  const name = escapeHTML(character.name);
  const species = escapeHTML(character.species || "Desconocida");
  const origin = escapeHTML(character.origin?.name || "Desconocido");
  const gender = escapeHTML(character.gender || "Desconocido");
  const status = String(character.status || "unknown").toLowerCase();
  const image = escapeHTML(character.image);
  const label = (saved ? "Quitar a " : "Agregar a ") + name + (saved ? " de favoritos" : " a favoritos");
  return '<article class="character-card"><div class="card-image-wrap">' +
    '<img class="card-image" src="' + image + '" alt="Retrato de ' + name + '" loading="lazy">' +
    '<span class="status-badge"><span class="status-dot ' + status + '" aria-hidden="true"></span>' + escapeHTML(status === "alive" ? "Vivo" : status === "dead" ? "Muerto" : "Desconocido") + '</span>' +
    '<button class="favorite-button" data-id="' + Number(character.id) + '" type="button" aria-label="' + label + '" aria-pressed="' + saved + '">' + (saved ? "♥" : "♡") + '</button></div>' +
    '<div class="card-content"><p class="card-id">EXPEDIENTE #' + Number(character.id) + '</p><h3 title="' + name + '">' + name + '</h3>' +
    '<dl class="character-details"><div><dt>Especie</dt><dd title="' + species + '">' + species + '</dd></div><div><dt>Origen</dt><dd title="' + origin + '">' + origin + '</dd></div><div><dt>Género</dt><dd>' + gender + '</dd></div></dl></div></article>';
}

function render(items, favoritesView) {
  const visible = sortFilter.value === "az"
    ? [...items].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
    : items;
  grid.setAttribute("aria-busy", "false");
  if (!visible.length) {
    const title = favoritesView ? "Tu lista está vacía" : "No encontramos coincidencias";
    const message = favoritesView ? "Guarda un personaje con el corazón de su ficha." : "Prueba con otro nombre o cambia los filtros.";
    grid.innerHTML = '<div class="state-card"><span class="state-icon" aria-hidden="true">⌕</span><strong>' + title + '</strong><p>' + message + '</p></div>';
    return;
  }
  grid.innerHTML = visible.map(renderCard).join("");
}

function updatePagination() {
  $("#pagination").hidden = favoritesOnly || pages <= 1;
  previousButton.disabled = page <= 1;
  nextButton.disabled = page >= pages;
  $("#pageLabel").textContent = "Página " + page + " de " + pages;
  $("#pageIndicator").textContent = page + "/" + pages;
}

function renderFavorites() {
  const name = searchName.toLocaleLowerCase();
  const status = statusFilter.value.toLowerCase();
  const species = speciesFilter.value.toLowerCase();
  const matches = favorites.filter((item) =>
    (!name || item.name.toLocaleLowerCase().includes(name)) &&
    (!status || String(item.status).toLowerCase() === status) &&
    (!species || String(item.species).toLowerCase() === species)
  );
  characters = matches;
  render(matches, true);
  $("#resultCount").textContent = matches.length;
  $("#pageIndicator").textContent = "—";
  $("#pageLabel").textContent = "Favoritos";
  $("#pagination").hidden = true;
  $("#resultsMessage").textContent = matches.length + " favorito" + (matches.length === 1 ? "" : "s") + " guardado" + (matches.length === 1 ? "" : "s");
  updateFilterSummary();
}

async function loadCharacters() {
  if (favoritesOnly) { renderFavorites(); return; }
  const activeRequest = ++requestId;
  const params = new URLSearchParams({ page: String(page) });
  if (searchName) params.set("name", searchName);
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (speciesFilter.value) params.set("species", speciesFilter.value);
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = '<div class="loading-card"><span class="loader" aria-hidden="true"></span><p>Abriendo portal interdimensional...</p></div>';
  $("#resultsMessage").textContent = "Consultando la API...";
  try {
    const response = await fetch(API_URL + "?" + params.toString(), { headers: { Accept: "application/json" } });
    if (activeRequest !== requestId) return;
    if (response.status === 404) {
      characters = [];
      pages = 1;
      page = 1;
      render([], false);
      $("#resultCount").textContent = "0";
      $("#pageIndicator").textContent = "—";
      $("#pagination").hidden = true;
      $("#resultsMessage").textContent = "La búsqueda no devolvió resultados.";
      updateFilterSummary();
      return;
    }
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (activeRequest !== requestId) return;
    characters = Array.isArray(data.results) ? data.results : [];
    pages = data.info?.pages || 1;
    const count = data.info?.count || 0;
    render(characters, false);
    $("#resultCount").textContent = count;
    $("#resultsMessage").textContent = count + " personaje" + (count === 1 ? "" : "s") + " encontrado" + (count === 1 ? "" : "s");
    updatePagination();
    updateFilterSummary();
  } catch (error) {
    if (activeRequest !== requestId) return;
    console.error("No fue posible consultar la API:", error);
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = '<div class="state-card"><span class="state-icon" aria-hidden="true">⚠</span><strong>No pudimos conectar</strong><p>Revisa tu conexión e inténtalo de nuevo en unos momentos.</p></div>';
    $("#resultCount").textContent = "—";
    $("#pageIndicator").textContent = "—";
    $("#pagination").hidden = true;
    $("#resultsMessage").textContent = "La consulta a la API falló.";
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchName = searchInput.value.trim();
  page = 1;
  loadCharacters();
});
statusFilter.addEventListener("change", () => { page = 1; loadCharacters(); });
speciesFilter.addEventListener("change", () => { page = 1; loadCharacters(); });
sortFilter.addEventListener("change", () => favoritesOnly ? renderFavorites() : render(characters, false));
previousButton.addEventListener("click", () => { if (page > 1) { page -= 1; loadCharacters(); } });
nextButton.addEventListener("click", () => { if (page < pages) { page += 1; loadCharacters(); } });
$("#clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "";
  speciesFilter.value = "";
  sortFilter.value = "api";
  searchName = "";
  page = 1;
  if (favoritesOnly) { favoritesOnly = false; favoritesToggle.setAttribute("aria-pressed", "false"); }
  loadCharacters();
});
favoritesToggle.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
  if (favoritesOnly) { requestId += 1; renderFavorites(); } else { page = 1; loadCharacters(); }
});
grid.addEventListener("click", (event) => {
  const button = event.target.closest(".favorite-button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const character = characters.find((item) => item.id === id) || favorites.find((item) => item.id === id);
  if (!character) return;
  favorites = favorites.some((item) => item.id === id) ? favorites.filter((item) => item.id !== id) : [...favorites, character];
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch (error) { console.warn(error); }
  updateFavoriteCount();
  if (favoritesOnly) renderFavorites(); else render(characters, false);
});
themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
setTheme(readSaved(THEME_KEY, "light") === "dark" ? "dark" : "light");
updateFavoriteCount();
loadCharacters();

sortFilter.addEventListener("change", updateFilterSummary);
