
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const MAX_DIMENSION = 900;       // longest photo edge, in pixels
const JPEG_QUALITY = 0.7;        // 0-1, lower = smaller file
const MAX_BASE64_LENGTH = 850000; // keep well under Firestore's 1MB doc limit

/**
 * Resize + compress an image file in the browser and return it as a
 * Base64 data URL (e.g. "data:image/jpeg;base64,...").
 */
function fileToCompressedBase64(file, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read the selected image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const form = document.getElementById("uploadForm");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");
const useLocationBtn = document.getElementById("useLocationBtn");
const locationInput = document.getElementById("location");
const dropZone = document.getElementById("dropZone");
const photoInput = document.getElementById("photo");
const dzFilename = document.getElementById("dzFilename");
const dzText = dropZone.querySelector(".dz-text");
const signInGate = document.getElementById("signInGate");
const uploadWrap = document.getElementById("uploadWrap");

let currentUser = null;

// Gate the whole form behind sign-in — only signed-in field users can
// submit, so every post can be credited to a real account (POST.userID).
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    signInGate.style.display = "none";
    uploadWrap.style.display = "flex";
  } else {
    signInGate.style.display = "block";
    uploadWrap.style.display = "none";
  }
});

function showStatus(text, type) {
  statusMsg.textContent = text;
  statusMsg.className = `status-msg show ${type}`;
}

// Show the chosen filename and a light "selected" state on the drop zone.
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    dzFilename.textContent = file.name;
    dzText.textContent = "Photo selected — tap to change";
    dropZone.classList.add("dragover");
  } else {
    dzFilename.textContent = "";
    dzText.textContent = "Tap to choose a photo from your gallery";
    dropZone.classList.remove("dragover");
  }
});

// Function requirement: let user pin a location (via device GPS) rather
// than typing coordinates manually.
useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Location services are not available on this device.", "error");
    return;
  }
  useLocationBtn.disabled = true;
  useLocationBtn.textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locationInput.value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "Use my location";
    },
    () => {
      showStatus("Could not get your location. Please enter it manually.", "error");
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "Use my location";
    }
  );
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    showStatus("Please sign in before submitting a discovery.", "error");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const photoFile = photoInput.files[0];

  if (!title || !category || !location || !description || !photoFile) {
    showStatus("Please fill in every field and choose a photo.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Processing photo…";
  showStatus("Resizing and compressing your photo…", "info");

  try {
    // 1. Media upload — resize/compress the photo and encode it as Base64
    //    (in place of a Firebase Storage upload; see note at top of file).
    let imageDataUrl = await fileToCompressedBase64(photoFile);

    if (imageDataUrl.length > MAX_BASE64_LENGTH) {
      // Still too large — compress harder before giving up.
      imageDataUrl = await fileToCompressedBase64(photoFile, 0.5);
    }

    if (imageDataUrl.length > MAX_BASE64_LENGTH) {
      showStatus("This photo is too large even after compression. Please choose a smaller or simpler photo.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit for review";
      return;
    }

    // 2. Data insertion — save the post with default status "Pending",
    //    tagged with the signed-in user's ID and display name (POST.userID
    //    / POST.userName in the ERD).
    showStatus("Saving your submission…", "info");
    await addDoc(collection(db, "posts"), {
      title,
      category,
      location,
      description,
      image: imageDataUrl,
      status: "Pending",
      userID: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp()
    });

    showStatus("Thanks! Your discovery was submitted and is awaiting admin review.", "success");
    form.reset();
    dzFilename.textContent = "";
    dzText.textContent = "Tap to choose a photo from your gallery";
    dropZone.classList.remove("dragover");
  } catch (err) {
    console.error(err);
    showStatus("Something went wrong while submitting. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit for review";
  }
});
