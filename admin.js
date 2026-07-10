
import { db, ADMIN_PASSCODE } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const gate = document.getElementById("gate");
const dashboard = document.getElementById("dashboard");
const passcodeInput = document.getElementById("passcode");
const enterBtn = document.getElementById("enterBtn");
const gateMsg = document.getElementById("gateMsg");
const pendingContainer = document.getElementById("pendingContainer");
const pendingCount = document.getElementById("pendingCount");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

adminLogoutBtn.addEventListener("click", () => {
  // This just resets the local passcode session (see note on
  // ADMIN_PASSCODE in firebase-config.js — it isn't a real account).
  dashboard.style.display = "none";
  gate.style.display = "block";
  passcodeInput.value = "";
  gateMsg.classList.remove("show");
  pendingContainer.innerHTML = "";
});

enterBtn.addEventListener("click", checkPasscode);
passcodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPasscode();
});

function checkPasscode() {
  if (passcodeInput.value === ADMIN_PASSCODE) {
    gate.style.display = "none";
    dashboard.style.display = "block";
    loadPendingPosts();
  } else {
    gateMsg.textContent = "Incorrect passcode. Please try again.";
    gateMsg.classList.add("show");
  }
}

async function loadPendingPosts() {
  pendingContainer.innerHTML = `<div class="loading-state">Loading pending queue…</div>`;
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("status", "==", "Pending"),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    updateCount(snapshot.size);

    if (snapshot.empty) {
      pendingContainer.innerHTML = `<div class="empty-state">No pending submissions right now.</div>`;
      return;
    }

    pendingContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const post = docSnap.data();
      pendingContainer.appendChild(buildRow(docSnap.id, post));
    });
  } catch (err) {
    console.error(err);
    pendingContainer.innerHTML = `<div class="empty-state">Could not load the queue. Check your Firebase configuration in js/firebase-config.js.</div>`;
  }
}

function buildRow(id, post) {
  const row = document.createElement("div");
  row.className = "admin-row";
  row.innerHTML = `
    <img class="thumb-sm" src="${post.image || ""}" alt="${escapeHtml(post.title)}" />
    <div class="info">
      <span class="tag ${post.category === "Flora" ? "flora" : "fauna"}">${post.category}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <div class="meta">📍 ${escapeHtml(post.location || "Unknown location")}</div>
      <div class="desc">${escapeHtml(post.description || "")}</div>
    </div>
    <div class="admin-actions">
      <button class="btn btn-approve" data-action="approve">Approve</button>
      <button class="btn btn-delete" data-action="delete">Delete</button>
    </div>
  `;

  row.querySelector('[data-action="approve"]').addEventListener("click", async (e) => {
    e.target.disabled = true;
    await updateDoc(doc(db, "posts", id), { status: "Approved" });
    row.remove();
    checkEmpty();
  });

  row.querySelector('[data-action="delete"]').addEventListener("click", async (e) => {
    e.target.disabled = true;
    await deleteDoc(doc(db, "posts", id));
    row.remove();
    checkEmpty();
  });

  return row;
}

function updateCount(n) {
  pendingCount.textContent = `${n} waiting`;
}

function checkEmpty() {
  const remaining = pendingContainer.querySelectorAll(".admin-row").length;
  updateCount(remaining);
  if (remaining === 0) {
    pendingContainer.innerHTML = `<div class="empty-state">No pending submissions right now.</div>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
