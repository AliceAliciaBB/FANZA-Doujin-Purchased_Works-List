const DEFAULT_DATA_URL = "../data/test.json";

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

async function loadDefaultData() {
    try {
        const response = await fetch(DEFAULT_DATA_URL);
        if (!response.ok) throw new Error("data not found");
        const works = await response.json();
        renderItems(works);
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
        renderItems(works);
    });
}

setupFileInput();
loadDefaultData();
