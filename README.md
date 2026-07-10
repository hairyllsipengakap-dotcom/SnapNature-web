# SnapNature — Individual Project (CSC264)

A simple web platform for collecting, reviewing, and publishing verified flora and
fauna sightings, built from the project proposal. Three pages, matching the
functional requirements table in the proposal:

| Page          | File          | Functional requirement(s) covered                          |
|---------------|---------------|--------------------------------------------------------------|
| Login/Sign-up | `login.html`  | Field-user accounts (Firebase Authentication)                |
| Home Feed     | `index.html`  | 4. Feed filtering (All / Flora / Fauna, Approved only)       |
| Submit page   | `upload.html` | 1. Post creation, 2. Media upload, 3. Data insertion (requires sign-in) |
| Admin panel   | `admin.html`  | 5. Status modification (Approve / Delete pending posts), with logout |

## Folder structure

```
SnapNature/
├── index.html          # Home feed
├── upload.html         # Discovery submission form (sign-in required)
├── admin.html          # Admin review dashboard
├── login.html          # Field-user sign-up / sign-in
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js   # <- put your Firebase keys here
│   ├── auth-nav.js          # shared "Login" / "Hi, {name} · Logout" widget
│   ├── login.js
│   ├── home.js
│   ├── upload.js
│   └── admin.js
└── README.md
```

## 1. Open in VS Code

1. Unzip / copy the `SnapNature` folder anywhere on your computer.
2. In VS Code: **File → Open Folder…** → select `SnapNature`.
3. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.

## 2. Create your Firebase project

1. Go to https://console.firebase.google.com → **Add project**.
2. Once created, click the **</>** (Web) icon to register a web app.
3. Copy the `firebaseConfig` object Firebase shows you.
4. Open `js/firebase-config.js` in VS Code and paste your values in, replacing
   the `"YOUR_..."` placeholders.
5. In the left menu of the Firebase console:
   - **Build → Firestore Database → Create database** (start in *test mode*
     for development).
   - **Build → Authentication → Get started → Sign-in method → Email/Password**
     → enable it. This is required for `login.html` to work.
   - You do **not** need Firebase Storage — see the note below.

> Test mode rules expire after 30 days — that's fine for coursework, but
> remember this is not production-ready security.

### Why there's no Firebase Storage step

As of February 2026, Google requires every Firebase project to be on the
paid **Blaze** plan (a linked billing card) before it can use Cloud Storage
for Firebase at all — even for usage that stays within the free quota. To
avoid requiring a card for a coursework project, this app does **not** use
Firebase Storage. Instead, `js/upload.js` resizes each photo down to a
max of 900px on its longest edge, compresses it to a JPEG at ~70% quality,
and stores it as a Base64 text string directly inside the Firestore
document's `image` field. The home feed and admin panel display it exactly
like a normal image URL, since a Base64 data URL works as an `<img src>`
value.

Trade-offs worth knowing (fine for an individual project, but not how a
production app would do it):
- Firestore documents are capped at 1MB, so very large or complex photos
  may fail — the app automatically retries with heavier compression once,
  and shows an error if it's still too big.
- Images load as inline text rather than from a CDN, so the feed is
  slightly heavier to fetch than it would be with real file storage.

### Composite index (one-time step)

Both the home feed and the admin panel filter by `status` **and** sort by
`timestamp`. The first time you run the app, Firestore will show an error in
the browser console with a link that says "create index" — click it, wait
about a minute for the index to build, then reload the page. This only needs
to be done once per project.

## 3. Change the admin passcode (optional)

The admin page is protected by a simple passcode, set in
`js/firebase-config.js`:

```js
export const ADMIN_PASSCODE = "snapnature2026";
```

Change this to whatever you like before submitting/demoing.

## 4. Run it

Right-click `index.html` in VS Code → **Open with Live Server**. This must be
served over `http://localhost` (not opened directly as a file) because
Firebase's SDK and the ES module imports require it.

- Go to **Home Feed** — shows approved posts only, filterable by category.
- Go to **Submit a Discovery** — fill the form, pick a photo, submit. It is
  saved with status `Pending` and will not show on the home feed yet.
- Go to **Admin** — enter the passcode, see the pending post you just
  created, and click **Approve** (it will now appear on the home feed) or
  **Delete**.

## Authentication model

Two separate, intentionally different mechanisms are used:

- **Field users** get real accounts via **Firebase Authentication**
  (email + password). Signing in is required before `upload.html` will let
  you submit — this is what lets each post carry a real `userID` and
  `userName`, matching the ERD's `USER` entity. A "Login" link appears in
  the nav when signed out; once signed in, it becomes "👤 {name} · Logout"
  on every page.
- **The admin role** stays a simple shared passcode (see `ADMIN_PASSCODE`
  in `js/firebase-config.js`), not a Firebase Auth account — there's a
  dedicated **Logout** button in the admin dashboard that just re-locks the
  passcode gate for the current browser session. This was kept simple on
  purpose, matching the proposal's minimum requirement of just gating
  admin actions, without needing a separate admin account system.

## Notes for the report

- **Database design**: implemented as a single Firestore collection `posts`
  with fields `title, category, location, description, image, status,
  userID, userName, timestamp`, matching the ERD's `POST` entity —
  `userID`/`userName` are now populated from the signed-in Firebase Auth
  user rather than simplified away. The `ADMINISTRATOR` entity is still
  represented only as a shared passcode rather than a full account system,
  since the functional requirements only ask for admin actions to be
  gated, not for a full admin account model.
- **Process design**: `upload.js` performs Process 1.0 (Upload) — the photo
  is resized/compressed in the browser and encoded as Base64 (D1, in place
  of Firebase Storage — see the note above on why), then the full record,
  tagged with the signed-in user's ID, is written to Firestore (D2).
  `admin.js` performs Process 2.0 (Control action) — reads the pending
  queue and updates status.
