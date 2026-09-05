const DEFAULT_DATA_URL = "../data/test.json";

let allWorks = [];

function removeThumbnailResolution(url) {
    return url.replace(/-\d+x\d+(?=\.\w+$)/, "");
}

function truncate(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function createItemElement(work) {
    const anchor = document.createElement("a");
    anchor.className = "item";
    anchor.href = work.pageLink;
    anchor.target = "_blank";
    anchor.rel = "noopener";

    const img = document.createElement("img");
    img.src = removeThumbnailResolution(work.thumbnail);
    img.alt = work.productId;
    anchor.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";

    const circleName = document.createElement("p");
    circleName.textContent = truncate(work.circleName, 7);
    meta.appendChild(circleName);

    const genre = document.createElement("p");
    genre.className = "genre";
    genre.textContent = work.genre;
    meta.appendChild(genre);

    anchor.appendChild(meta);

    const title = document.createElement("p");
    title.textContent = truncate(work.title, 40);
    anchor.appendChild(title);

    return anchor;
}

function renderItems(works) {
    const container = document.getElementById("container");
    container.innerHTML = "";
    works.forEach((work) => {
        container.appendChild(createItemElement(work));
    });
}

function renderEmptyMessage() {
    const container = document.getElementById("container");
    container.innerHTML = "";
    const message = document.createElement("p");
    message.className = "empty_message";
    message.textContent = "データなし";
    container.appendChild(message);
}

function sortWorks(works, sortOrder) {
    const sorted = [...works];
    switch (sortOrder) {
        case "title_asc":
            return sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
        case "title_desc":
            return sorted.sort((a, b) => b.title.localeCompare(a.title, "ja"));
        case "circle_asc":
            return sorted.sort((a, b) => a.circleName.localeCompare(b.circleName, "ja"));
        case "circle_desc":
            return sorted.sort((a, b) => b.circleName.localeCompare(a.circleName, "ja"));
        default:
            return sorted;
    }
}

function filterWorks(works, keyword) {
    if (!keyword) return works;
    const lowerKeyword = keyword.toLowerCase();
    return works.filter(
        (work) =>
            work.title.toLowerCase().includes(lowerKeyword) ||
            work.circleName.toLowerCase().includes(lowerKeyword)
    );
}

function getSelectedGenres() {
    const genreMenu = document.getElementById("genre_menu");
    return Array.from(genreMenu.querySelectorAll("input[type=checkbox]:checked")).map(
        (checkbox) => checkbox.value
    );
}

function filterByGenre(works, genres) {
    if (genres.length === 0) return works;
    return works.filter((work) => genres.includes(work.genre));
}

function updateGenreOptions(works) {
    const genreMenu = document.getElementById("genre_menu");
    const selectedGenres = getSelectedGenres();
    const genres = Array.from(new Set(works.map((work) => work.genre))).sort((a, b) =>
        a.localeCompare(b, "ja")
    );

    genreMenu.innerHTML = "";
    genres.forEach((genre) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = genre;
        checkbox.checked = selectedGenres.includes(genre);
        checkbox.addEventListener("change", applyFilterAndSort);
        label.appendChild(checkbox);
        label.append(genre);
        genreMenu.appendChild(label);
    });
}

function setupGenreDropdown() {
    const genreToggle = document.getElementById("genre_toggle");
    const genreMenu = document.getElementById("genre_menu");
    genreToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        genreMenu.classList.toggle("open");
    });
    document.addEventListener("click", (event) => {
        if (!genreMenu.contains(event.target) && event.target !== genreToggle) {
            genreMenu.classList.remove("open");
        }
    });
}

function updateURLParams() {
    const keyword = document.getElementById("search_input").value;
    const genres = getSelectedGenres();
    const sortOrder = document.getElementById("sort_select").value;

    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (genres.length > 0) params.set("genres", genres.join(","));
    if (sortOrder && sortOrder !== "default") params.set("sort", sortOrder);

    const query = params.toString();
    const newURL = query ? `${location.pathname}?${query}` : location.pathname;
    history.replaceState(null, "", newURL);
}

function applyStateFromURLParams() {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const genres = (params.get("genres") || "").split(",").filter(Boolean);
    const sortOrder = params.get("sort") || "default";

    document.getElementById("search_input").value = keyword;
    document.getElementById("sort_select").value = sortOrder;

    const genreMenu = document.getElementById("genre_menu");
    genreMenu.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        checkbox.checked = genres.includes(checkbox.value);
    });
}

function applyFilterAndSort() {
    const keyword = document.getElementById("search_input").value;
    const genres = getSelectedGenres();
    const sortOrder = document.getElementById("sort_select").value;
    const filteredByGenre = filterByGenre(allWorks, genres);
    const filtered = filterWorks(filteredByGenre, keyword);
    const sorted = sortWorks(filtered, sortOrder);
    if (sorted.length === 0) {
        renderEmptyMessage();
    } else {
        renderItems(sorted);
    }
    updateURLParams();
}

function setWorks(works) {
    allWorks = works;
    updateGenreOptions(works);
    applyStateFromURLParams();
    applyFilterAndSort();
}

async function loadDefaultData() {
    try {
        const response = await fetch(DEFAULT_DATA_URL);
        if (!response.ok) throw new Error("data not found");
        const works = await response.json();
        setWorks(works);
    } catch (e) {
        renderEmptyMessage();
    }
}

function setupFileInput() {
    const fileInput = document.getElementById("file_input");
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const text = await file.text();
        const works = JSON.parse(text);
        setWorks(works);
    });
}

function setupSearchAndSort() {
    document.getElementById("search_input").addEventListener("input", applyFilterAndSort);
    document.getElementById("sort_select").addEventListener("change", applyFilterAndSort);
}

setupFileInput();
setupSearchAndSort();
setupGenreDropdown();
loadDefaultData();
