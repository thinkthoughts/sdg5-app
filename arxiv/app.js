// === LOAD DATA ===

async function loadPaperIndex() {
  const res = await fetch("/arxiv/data/index.json");
  if (!res.ok) throw new Error("index.json failed");
  return res.json();
}

async function loadPaper(id) {
  const res = await fetch(`/arxiv/data/${id}.json`);
  if (!res.ok) throw new Error(`failed: ${id}`);
  return res.json();
}

// === SAFE TEXT ===

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// === CELLS ===

function repoCell(repo) {
  if (!repo) return "—";
  return `<a href="${repo}" target="_blank" rel="noopener noreferrer">repo</a>`;
}

function colabCell(colab) {
  if (!colab) return "—";
  return `<a href="${colab}" target="_blank" rel="noopener noreferrer">colab</a>`;
}

function tweetCell(tweet) {
  if (!tweet) return "—";
  return `<a href="${tweet}" target="_blank" rel="noopener noreferrer">tweet</a>`;
}

function paperCell(link) {
  if (!link) return "—";
  return `<a href="/arxiv/${link}">note</a>`;
}

// === RENDER ===

function renderRows(papers) {
  const tbody = document.getElementById("papersBody");

  if (!papers.length) {
    tbody.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
    return;
  }

  tbody.innerHTML = papers.map(p => `
    <tr>
      <td>${safeText(p.area)}</td>

      <td>
        <a href="${p.arxiv}" target="_blank" rel="noopener noreferrer">
          ${safeText(p.id)}
        </a>
      </td>

      <td>
        <strong>${safeText(p.title)}</strong>
      </td>

      <td>${paperCell(p.paper_page)}</td>

      <td>${repoCell(p.repo)}</td>

      <td>${colabCell(p.colab)}</td>

      <td>${tweetCell(p.tweet)}</td>
    </tr>
  `).join("");
}

// === SEARCH ===

function attachSearch(all) {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    const filtered = all.filter(p =>
      [
        p.id,
        p.title,
        p.area,
        ...(p.tags || [])
      ].join(" ").toLowerCase().includes(q)
    );

    renderRows(filtered);
  });
}

// === INIT ===

async function init() {
  try {
    const ids = await loadPaperIndex();
    const papers = await Promise.all(ids.map(loadPaper));

    papers.sort((a, b) => b.id.localeCompare(a.id));

    renderRows(papers);
    attachSearch(papers);

  } catch (err) {
    console.error(err);
    document.getElementById("papersBody").innerHTML =
      `<tr><td colspan="7">Error loading data</td></tr>`;
  }
}

init();
