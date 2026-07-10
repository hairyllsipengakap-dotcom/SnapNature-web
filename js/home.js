
import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const feedContainer = document.getElementById("feedContainer");
const filterBar = document.getElementById("filterBar");
const countChip = document.getElementById("countChip");

let allPosts = [];
let activeFilter = "All";

async function loadApprovedPosts() {
  feedContainer.innerHTML = `<div class="loading-state">Loading approved posts…</div>`;
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("status", "==", "Approved"),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    allPosts = [];
    snapshot.forEach((doc) => allPosts.push({ id: doc.id, ...doc.data() }));

    renderPosts();
  } catch (err) {
    console.error(err);
    feedContainer.innerHTML = `<div class="empty-state">Could not load posts. Check your Firebase configuration in js/firebase-config.js.</div>`;
    countChip.textContent = "— entries";
  }
}

function renderPosts() {
  const filtered =
    activeFilter === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeFilter);

  countChip.textContent = `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`;

  if (filtered.length === 0) {
    feedContainer.innerHTML = `<div class="empty-state">No approved ${activeFilter === "All" ? "" : activeFilter.toLowerCase()} posts yet. Be the first to submit one.</div>`;
    return;
  }

  feedContainer.innerHTML = filtered
    .map((post, i) => {
      const fid = String(i + 1).padStart(3, "0");
      return `
      <div class="card">
        <div class="thumb-wrap">
          <img class="thumb" src="${post.image || ""}" alt="${escapeHtml(post.title)}" />
          <span class="stamp ${post.category === "Flora" ? "flora" : "fauna"}">${post.category}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(post.title)}</h3>
          <p class="desc">${escapeHtml(post.description || "")}</p>
          <div class="field-strip">
            <span class="fid">SN-${fid}</span>
            <span>${escapeHtml(post.location || "location unknown")}</span>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = btn.dataset.filter;
  renderPosts();
});

loadApprovedPosts();
