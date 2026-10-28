const API_URL = "https://rickandmortyapi.com/api/character";
const FAVORITES_KEY = "atlas-rm-favorites";
const THEME_KEY = "atlas-rm-theme";
const grid = document.querySelector("#characterGrid");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const speciesFilter = document.querySelector("#speciesFilter");
const favoritesToggle = document.querySelector("#favoritesToggle");
const themeToggle = document.querySelector("#themeToggle");
const previousButton = document.querySelector("#prevPage");
const nextButton = document.querySelector("#nextPage");
let currentPage = 1;
let totalPages = 1;
let searchTerm = "";
let showingFavorites = false;
let requestNumber = 0;
let currentCharacters = [];
let favorites = readFavorites();

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function saveFavorites() {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }
  catch (error) { console.warn("El navegador no permitió guardar favoritos.", error); }
}

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character]);
}

function statusName(status) {
  return ({ Alive: "Vivo", Dead: "Muerto", unknown: "Desconocido" })[status] || status || "Desconocido";
}

function updateFavoriteCounters() {
  document.querySelector("#favoriteCount").textContent = favorites.length;
  document.querySelector("#favoriteButtonCount").textContent = favorites.length;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.innerHTML = isDark
    ? '<span aria-hidden="true">☀</span><span>Modo claro</span>'
    : '<span aria-hidden="true">☾</span><span>Modo oscuro</span>';
  themeToggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  try { localStorage.setItem(THEME_KEY, theme); }
  catch (error) { console.warn("El navegador no permitió guardar el tema.", error); }
}

function updateFilterSummary() {
  const labels = [];
  if (searchTerm) labels.push("nombre: " + searchTerm);
  if (statusFilter.value) labels.push("estado: " + statusFilter.selectedOptions[0].text);
  if (speciesFilter.value) labels.push("especie: " + speciesFilter.selectedOptions[0].text);
  document.querySelector("#activeFilters").textContent = labels.length
    ? labels.join(" · ")
    : showingFavorites ? "Tu selección guardada" : "Mostrando personajes del universo";
}

function renderCard(character) {
  const isFavorite = favorites.some((saved) => saved.id === character.id);
  const name = escapeHTML(character.name);
  const origin = escapeHTML(character.origin?.name || "Desconocido");
  const species = escapeHTML(character.species || "Desconocida");
  const gender = escapeHTML(character.gender || "Desconocido");
  const status = String(character.status || "unknown").toLowerCase();
  const image = escapeHTML(character.image);
  const favoriteLabel = (isFavorite ? "Quitar a " : "Agregar a ") + name + " " + (isFavorite ? "de" : "a") + " favoritos";
  return '<article class="character-card"><div class="card-image-wrap">' +
    '<img class="card-image" src="' + image + '" alt="Retrato de ' + name + '" loading="lazy">' +
    '<span class="status-badge"><span class="status-dot ' + status + '" aria-hidden="true"></span>' + escapeHTML(statusName(character.status)) + '</span>' +
    '<button class="favorite-button" data-id="' + Number(character.id) + '" type="button" aria-label="' + favoriteLabel + '" aria-pressed="' + isFavorite + '">' + (isFavorite ? "♥" : "♡") + '</button></div>' +
    '<div class="card-content"><p class="card-id">EXPEDIENTE #' + Number(character.id) + '</p><h3 title="' + name + '">' + name + '</h3>' +
    '<dl class="character-details"><div><dt>Especie</dt><dd title="' + species + '">' + species + '</dd></div>' +
    '<div><dt>Origen</dt><dd title="' + origin + '">' + origin + '</dd></div><div><dt>Género</dt><dd>' + gender + '</dd></div></dl></div></article>';
}

function renderCharacters(characters) {
  grid.setAttribute("aria-busy", "false");
  if (!characters.length) {
    grid.innerHTML = '<div class="state-card"><span class="state-icon" aria-hidden="true">⌕</span><strong>No encontramos coincidencias</strong><p>Prueba con otro nombre o cambia los filtros.</p></div>';
    return;
  }
  grid.innerHTML = characters.map(renderCard).join("");
}

function showLoading() {
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = '<div class="loading-card"><span class="loader" aria-hidden="true"></span><p>Abriendo portal interdimensional...</p></div>';
  document.querySelector("#resultsMessage").textContent = "Consultando la API...";
}

function updatePagination() {
  document.querySelector("#pagination").hidden = showingFavorites || totalPages <= 1;
  previousButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
  document.querySelector("#pageLabel").textContent = "Página " + currentPage + " de " + totalPages;
  document.querySelector("#pageIndicator").textContent = currentPage + "/" + totalPages;
}

function renderFavorites() {
  const name = searchTerm.toLocaleLowerCase();
  const status = statusFilter.value.toLowerCase();
  const species = speciesFilter.value.toLowerCase();
  const matches = favorites.filter((character) =>
    (!name || character.name.toLocaleLowerCase().includes(name)) &&
    (!status || String(character.status).toLowerCase() === status) &&
    (!species || String(character.species).toLowerCase() === species)
  );
  currentCharacters = matches;
  renderCharacters(matches);
  document.querySelector("#resultCount").textContent = matches.length;
  document.querySelector("#pageIndicator").textContent = "—";
  document.querySelector("#pageLabel").textContent = "Favoritos";
  document.querySelector("#pagination").hidden = true;
  document.querySelector("#resultsMessage").textContent = matches.length
    ? matches.length + " favorito" + (matches.length === 1 ? "" : "s") + " guardado" + (matches.length === 1 ? "" : "s")
    : "Tu lista de favoritos está vacía.";
  updateFilterSummary();
}

async function loadCharacters() {
  if (showingFavorites) { renderFavorites(); return; }
  const requestId = ++requestNumber;
  const parameters = new URLSearchParams({ page: String(currentPage) });
  if (searchTerm) parameters.set("name", searchTerm);
  if (statusFilter.value) parameters.set("status", statusFilter.value);
  if (speciesFilter.value) parameters.set("species", speciesFilter.value);
  showLoading();

  try {
    const response = await fetch(API_URL + "?" + parameters.toString(), { headers: { Accept: "application/json" } });
    if (requestId !== requestNumber) return;
    if (response.status === 404) {
      currentCharacters = [];
      totalPages = 1;
      currentPage = 1;
      renderCharacters([]);
      document.querySelector("#resultCount").textContent = "0";
      document.querySelector("#pageIndicator").textContent = "—";
      document.querySelector("#pagination").hidden = true;
      document.querySelector("#resultsMessage").textContent = "La búsqueda no devolvió resultados.";
      updateFilterSummary();
      return;
    }
    if (!response.ok) throw new Error("La API respondió con el estado " + response.status + ".");
    const data = await response.json();
    if (requestId !== requestNumber) return;
    currentCharacters = Array.isArray(data.results) ? data.results : [];
    totalPages = data.info?.pages || 1;
    const count = data.info?.count || 0;
    renderCharacters(currentCharacters);
    document.querySelector("#resultCount").textContent = count;
    document.querySelector("#resultsMessage").textContent = count + " personaje" + (count === 1 ? "" : "s") + " encontrado" + (count === 1 ? "" : "s");
    updatePagination();
    updateFilterSummary();
  } catch (error) {
    if (requestId !== requestNumber) return;
    console.error("No fue posible consultar Rick and Morty API:", error);
    currentCharacters = [];
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = '<div class="state-card"><span class="state-icon" aria-hidden="true">⚠</span><strong>No pudimos conectar</strong><p>Revisa tu conexión e inténtalo de nuevo en unos momentos.</p></div>';
    document.querySelector("#resultCount").textContent = "—";
    document.querySelector("#pageIndicator").textContent = "—";
    document.querySelector("#pagination").hidden = true;
    document.querySelector("#resultsMessage").textContent = "La consulta a la API falló.";
    updateFilterSummary();
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchTerm = searchInput.value.trim();
  currentPage = 1;
  loadCharacters();
});
statusFilter.addEventListener("change", () => { currentPage = 1; loadCharacters(); });
speciesFilter.addEventListener("change", () => { currentPage = 1; loadCharacters(); });
previousButton.addEventListener("click", () => { if (currentPage > 1) { currentPage -= 1; loadCharacters(); } });
nextButton.addEventListener("click", () => { if (currentPage < totalPages) { currentPage += 1; loadCharacters(); } });

document.querySelector("#clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "";
  speciesFilter.value = "";
  searchTerm = "";
  currentPage = 1;
  if (showingFavorites) {
    showingFavorites = false;
    favoritesToggle.setAttribute("aria-pressed", "false");
  }
  loadCharacters();
});

favoritesToggle.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  favoritesToggle.setAttribute("aria-pressed", String(showingFavorites));
  if (showingFavorites) { requestNumber += 1; renderFavorites(); }
  else { currentPage = 1; loadCharacters(); }
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".favorite-button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const character = currentCharacters.find((item) => item.id === id) || favorites.find((item) => item.id === id);
  if (!character) return;
  const isSaved = favorites.some((item) => item.id === id);
  favorites = isSaved ? favorites.filter((item) => item.id !== id) : [...favorites, character];
  saveFavorites();
  updateFavoriteCounters();
  if (showingFavorites) renderFavorites();
  else renderCharacters(currentCharacters);
});

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
let savedTheme = "light";
try { savedTheme = localStorage.getItem(THEME_KEY) || "light"; } catch { savedTheme = "light"; }
setTheme(savedTheme === "dark" ? "dark" : "light");
updateFavoriteCounters();
loadCharacters();
