
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBr0DnpsvdioyjBvwZf-GziXa5VUbeUFrg",
  authDomain: "snapnature-c69a5.firebaseapp.com",
  projectId: "snapnature-c69a5",
  storageBucket: "snapnature-c69a5.firebasestorage.app",
  messagingSenderId: "1072931196468",
  appId: "1:1072931196468:web:ee920383e28b872bc70461"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const ADMIN_PASSCODE = "admin2026";
