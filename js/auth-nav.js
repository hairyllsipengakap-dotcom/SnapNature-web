
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authStatusEl = document.getElementById("authStatus");

if (authStatusEl) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const name = user.displayName || user.email || "Field user";
      authStatusEl.innerHTML = `
        <span class="user-chip">👤 ${escapeHtml(name)}</span>
        <button type="button" class="link-btn" id="navLogoutBtn">Logout</button>
      `;
      document.getElementById("navLogoutBtn").addEventListener("click", async () => {
        await signOut(auth);
        // Send them back to the home feed after logging out.
        window.location.href = "index.html";
      });
    } else {
      authStatusEl.innerHTML = `<a href="login.html">Login</a>`;
    }
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
