# CampusParcel

A simple website for **secure parcel collection at South Asian University**, built with plain HTML, CSS and JavaScript (no frameworks, no backend).

## How it works

There are **two different OTPs**:

| OTP | Who makes it | Where it goes | What it is for |
|---|---|---|---|
| **Delivery OTP** | The delivery app (Flipkart, Amazon, ...) | Student types it on *Register Your Parcel* | The guard gives it to the delivery person to take the parcel |
| **Pickup OTP** | The guard (OTP box on the Guard Panel) | Emailed to the student | The student shows it to the guard to collect the parcel |

### The journey of one parcel (who gets which OTP)

1. **Student registers the parcel** and types the **delivery OTP** from Flipkart/Amazon.
   -> The student gets a confirmation email with the Parcel ID.
   -> **The guard desk gets an email** (`guardEmail` in `js/config.js`) with the student's name, phone, courier and the **delivery OTP**.
2. **The parcel arrives at the gate.** The guard gives the delivery OTP to the delivery person and takes the parcel.
3. **The guard registers the parcel** on the Guard Panel (shelf, photos) and presses **Register & Send OTP**.
   -> The guard's OTP box makes a **pickup OTP** and **emails it to the student**.
4. **The student comes to collect** and tells the guard the pickup OTP (from the email, or from the *My Parcels* page).
5. **The guard enters Parcel ID + pickup OTP** under *Verify & Handover*. If it matches, the parcel is marked *Collected*.

If email is not set up yet, the guard simply reads the pickup OTP shown on the Guard Panel to the student.

### Student
1. **Register Your Parcel** - fill the form with name, roll number, email, phone, courier and the delivery OTP. ("Any other instructions" is optional.) Parcels coming from a friend or family member use the second form.
2. When the parcel reaches the gate, a **pickup OTP is emailed** to the student.
3. **My Parcels** - enter roll number + email to see status, storage shelf and pickup OTP.

### Guard (Guard Login in the top menu, PIN protected)
1. See how many parcels are **pre-registered**, with the student's name, phone, courier and the **delivery OTP** (to give to the delivery person).
2. Press **Receive** on a parcel (or type details for a new one), add the shelf and photos, and press **Register & Send OTP**. The OTP box generates a 6-digit pickup OTP and emails it to the student's email address.
3. **Verify & Handover** - enter the Parcel ID and the student's pickup OTP. The parcel is marked *Collected* only if the OTP matches.

The default guard PIN is `1234`. Change it in `js/config.js` (`GUARD_PIN`). This is a simple front-end lock for the project, not real security.

## Turn on email (needed to send OTPs to Gmail)

The browser sends emails through the free service **EmailJS**, so you need to paste three values into `js/config.js`. Until then the Guard Panel shows "Email is NOT set up yet" and the guard has to read the OTP out to the student.

1. Create a free account at <https://www.emailjs.com>.
2. **Email Services -> Add New Service -> Gmail**, connect your Gmail and copy the **Service ID**.
3. **Email Templates -> Create New Template** and set exactly:
   - **To Email:** `{{to_email}}`
   - **Subject:** `{{subject}}`
   - **Content:** `{{message}}`

   Save it and copy the **Template ID**.
4. **Account -> General** -> copy the **Public Key**.
5. Open `js/config.js` and replace `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID` and `YOUR_TEMPLATE_ID`. (`supportEmail` (yashwardhan1907@gmail.com) receives complaints and feedback; `guardEmail` (sau202600861@students.sau.ac.in) receives the delivery OTP of every registered parcel.)
6. Open the Guard Panel and press **Send test email**. If it says *Email sent*, everything is ready. If not, the message shows the reason.

Common mistakes: the *To Email* field in the template is not `{{to_email}}`; the Gmail service is not connected; a key was copied with a space; the page is opened from a different website than the one allowed in EmailJS.

The form only accepts properly written email addresses (name@domain.com). A mailbox that does not exist cannot be detected by the browser; in that case EmailJS reports an error and the Guard Panel shows it together with the OTP so the guard can still tell the student.

## Folder structure

```
index.html            <- home / dashboard (main entry file)
pages/                <- all other pages
    register.html
    my-parcel.html
    guard-panel.html
    support.html
css/                  <- stylesheets
    style.css  header.css  footer.css
js/                   <- JavaScript
    config.js         (email keys, guard PIN)
    main.js           (shared helpers: storage, OTP, email)
    register.js  guard-login.js  guard.js  my-parcel.js  support.js
images/               <- South Asian University pictures
```

## Where each feature is in the code

| Feature | Where |
|---|---|
| OTP generator | `generateOtp()` in `js/main.js` |
| Parcel ID generator | `generateId()` in `js/main.js` |
| Saving data | `getList()` / `saveList()` in `js/main.js` (browser `localStorage`) |
| Email sending | `sendEmail()` in `js/main.js` |
| Pre-register a parcel | `js/register.js` |
| Guard PIN lock | `js/guard-login.js` |
| Pre-registered list, OTP box, receive parcel, verify OTP | `js/guard.js` |
| My Parcels | `js/my-parcel.js` |
| Complaints and feedback | `js/support.js` |

## If you see no colours / the buttons do nothing
The page looks for the `css/` and `js/` folders **next to** `index.html`. This breaks if you:
- open `index.html` from **inside the zip** (right-click the zip -> **Extract All** first), or
- copy `index.html` out of the folder on its own, or
- upload only the HTML files to GitHub / hosting (upload the whole folder structure).

## Run it on your computer
Double-click `index.html` (or use the *Live Server* extension in VS Code).

## Put it on GitHub and host it

1. Create a new **public** repository on GitHub (e.g. `campus-parcel`).
2. Upload everything in this folder so that `index.html` is in the **root** of the repository.
   ```
   git init
   git add .
   git commit -m "CampusParcel final project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campus-parcel.git
   git push -u origin main
   ```
3. **GitHub Pages:** repository **Settings -> Pages -> Deploy from a branch -> main / (root) -> Save**.
   The live link will be `https://<your-username>.github.io/campus-parcel/`.
   **InfinityFree:** upload the same folders into `htdocs` so `index.html` sits directly inside it.
4. Submit the repository link and the live site link.

## Good to know
- Data (parcels, complaints) is stored in the **browser's localStorage**, so the student and guard pages share data only when opened in the same browser. This is why the delivery OTP is also **emailed** to the guard desk, and why the pickup OTP is emailed to the student. For a demo on one laptop, everything also works without email. A real deployment would use a server and a database.
- Guard photos are not stored, only their file names.
- The EmailJS public key is meant to be visible in front-end code, so it is safe to push to GitHub.
