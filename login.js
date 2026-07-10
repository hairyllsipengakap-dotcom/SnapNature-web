
import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authFormWrap = document.getElementById("authFormWrap");
const signedInPanel = document.getElementById("signedInPanel");
const signedInAs = document.getElementById("signedInAs");

const tabSignIn = document.getElementById("tabSignIn");
const tabSignUp = document.getElementById("tabSignUp");
const nameField = document.getElementById("nameField");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authStatusMsg = document.getElementById("authStatusMsg");

let mode = "signin"; // or "signup"

function showStatus(text, type) {
  authStatusMsg.textContent = text;
  authStatusMsg.className = `status-msg show ${type}`;
}

tabSignIn.addEventListener("click", () => setMode("signin"));
tabSignUp.addEventListener("click", () => setMode("signup"));

function setMode(newMode) {
  mode = newMode;
  const isSignUp = mode === "signup";
  tabSignUp.classList.toggle("active", isSignUp);
  tabSignIn.classList.toggle("active", !isSignUp);
  nameField.style.display = isSignUp ? "flex" : "none";
  authSubmitBtn.textContent = isSignUp ? "Create account" : "Sign in";
  authStatusMsg.classList.remove("show");
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value.trim();

  if (!email || !password || (mode === "signup" && !name)) {
    showStatus("Please fill in every field.", "error");
    return;
  }

  authSubmitBtn.disabled = true;
  showStatus(mode === "signup" ? "Creating your account…" : "Signing you in…", "info");

  try {
    if (mode === "signup") {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      showStatus("Account created! Redirecting…", "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showStatus("Signed in! Redirecting…", "success");
    }
    setTimeout(() => { window.location.href = "upload.html"; }, 600);
  } catch (err) {
    console.error(err);
    showStatus(friendlyAuthError(err.code), "error");
    authSubmitBtn.disabled = false;
  }
});

function friendlyAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// If already signed in, show the "signed in" panel instead of the form.
onAuthStateChanged(auth, (user) => {
  if (user) {
    authFormWrap.style.display = "none";
    signedInPanel.style.display = "block";
    signedInAs.textContent = `Signed in as ${user.displayName || user.email}`;
  } else {
    authFormWrap.style.display = "block";
    signedInPanel.style.display = "none";
  }
});
