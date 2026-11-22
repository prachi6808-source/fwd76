// Tracks the parcel ID when receiving an existing pre-registered item
let linkedId = "";

// Check EmailJS setup status and wire up the test email button
const statusText = document.getElementById("email-status");
if (emailIsConfigured()) {
    statusText.textContent = "Email is set up. OTPs will be sent to students.";
} else {
    statusText.textContent = "Email is NOT set up yet. OTPs will not be emailed (see README, step 'Turn on email').";
}

document.getElementById("test-email-btn").addEventListener("click", async function () {
    const sent = await sendEmail(EMAILJS_CONFIG.supportEmail, "CampusParcel test email", "If you can read this, email sending works.");
    showMessage("email-test-message", emailNote(sent, EMAILJS_CONFIG.supportEmail), sent ? "success" : "error");
});

// Updates dashboard counters and re-renders the pre-registered parcels table
function refreshGuardPage() {
    const parcels = getList("parcels");
    const pre = parcels.filter(function (p) { return p.status === "Pre-registered"; });
    const atGate = parcels.filter(function (p) { return p.status === "At Main Gate"; });
    const done = parcels.filter(function (p) { return p.status === "Collected"; });

    document.getElementById("g-stat-pre").textContent = pre.length;
    document.getElementById("g-stat-gate").textContent = atGate.length;
    document.getElementById("g-stat-done").textContent = done.length;

    const body = document.getElementById("pre-rows");
    if (pre.length === 0) {
        body.innerHTML = '<tr><td colspan="8">No pre-registered parcels right now.</td></tr>';
        return;
    }

    let rows = "";
    pre.forEach(function (p) {
        const otpCell = p.deliveryOtp
            ? '<span class="otp-code">' + escapeHtml(p.deliveryOtp) + "</span>"
            : "Not needed (family / friend)";
        rows += "<tr>" +
            "<td>" + escapeHtml(p.id) + "</td>" +
            "<td>" + escapeHtml(p.studentName) + "<br><small>" + escapeHtml(p.rollNo) + "</small></td>" +
            "<td>" + escapeHtml(p.phone) + "</td>" +
            "<td>" + escapeHtml(p.courier) + "</td>" +
            "<td>" + otpCell + "</td>" +
            "<td>" + escapeHtml(p.instructions) + "</td>" +
            "<td>" + escapeHtml(p.createdAt) + "</td>" +
            '<td><button class="btn-primary" data-id="' + escapeHtml(p.id) + '">Receive</button></td>' +
            "</tr>";
    });
    body.innerHTML = rows;
}

// Populate the intake form when clicking "Receive" on a pre-registered row
document.getElementById("pre-rows").addEventListener("click", function (event) {
    const id = event.target.getAttribute("data-id");
    if (id === null) {
        return;
    }
    const p = getList("parcels").find(function (item) { return item.id === id; });

    document.getElementById("g-name").value = p.studentName;
    document.getElementById("g-roll").value = p.rollNo;
    document.getElementById("g-email").value = p.email;
    document.getElementById("g-courier").value = p.courier;
    linkedId = p.id;
    document.getElementById("linked-note").textContent =
        "Receiving pre-registered parcel " + p.id + ". Add the shelf and photos, then press Register.";
    document.getElementById("guard-register-form").scrollIntoView();
});

// Sync table automatically if a student submits a parcel in another open tab
window.addEventListener("storage", refreshGuardPage);

function newOtp() {
    document.getElementById("g-otp").value = generateOtp();
}
document.getElementById("g-generate-btn").addEventListener("click", newOtp);
newOtp();

// Log parcel arrival at the gate and dispatch pickup OTP to the student
document.getElementById("guard-register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = document.getElementById("guard-register-btn");
    button.disabled = true;
    button.textContent = "Sending...";

    const email = getValue("g-email");
    const otp = getValue("g-otp") || generateOtp();
    const storage = getValue("g-storage");

    // Store filenames only to avoid exceeding localStorage size limits
    const agentFile = document.getElementById("g-agent-photo").files[0];
    const shelfFile = document.getElementById("g-shelf-photo").files[0];

    const parcels = getList("parcels");

    let parcel = parcels.find(function (p) { return p.id === linkedId; });
    if (!parcel) {
        parcel = {
            id: generateId("CP", parcels),
            type: "delivery",
            phone: "",
            deliveryOtp: "",
            instructions: "None",
            createdAt: nowText()
        };
        parcels.push(parcel);
    }
    parcel.studentName = getValue("g-name");
    parcel.rollNo = getValue("g-roll").toUpperCase();
    parcel.email = email;
    parcel.courier = getValue("g-courier");
    parcel.storage = storage;
    parcel.pickupOtp = otp;
    parcel.status = "At Main Gate";
    parcel.receivedAt = nowText();
    parcel.agentPhoto = agentFile ? agentFile.name : "Not attached";
    parcel.shelfPhoto = shelfFile ? shelfFile.name : "Not attached";
    saveList("parcels", parcels);

    const text = "Hello " + parcel.studentName + ",\n\n" +
        "Your parcel from " + parcel.courier + " has reached the main gate.\n" +
        "Parcel ID: " + parcel.id + "\n" +
        "Stored at: " + storage + "\n\n" +
        "Your pickup OTP: " + otp + "\n\n" +
        "Show this OTP to the guard to collect your parcel.\n- CampusParcel";
    const sent = await sendEmail(email, "CampusParcel: Parcel " + parcel.id + " has arrived", text);

    if (sent) {
        showMessage("guard-register-message", "Parcel " + parcel.id + " registered. OTP " + otp + " was emailed to " + email + ".", "success");
    } else {
        showMessage("guard-register-message",
            "Parcel " + parcel.id + " registered, but the email failed (" + lastEmailError + "). Please give the student this OTP yourself: " + otp,
            "warning");
    }

    linkedId = "";
    document.getElementById("linked-note").textContent = "";
    document.getElementById("guard-register-form").reset();
    newOtp();
    refreshGuardPage();
    button.disabled = false;
    button.textContent = "Register & Send OTP";
});

// Verify student's pickup OTP before marking the parcel as collected
document.getElementById("verify-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const parcelId = cleanParcelId(getValue("v-parcel-id"));
    const otp = getValue("v-otp");

    const parcels = getList("parcels");
    const parcel = parcels.find(function (p) {
        return p.id === parcelId;
    });

    if (!parcel) {
        showMessage("verify-message", "No parcel found with ID " + parcelId + ".", "error");
        return;
    }
    if (parcel.status === "Collected") {
        showMessage("verify-message", "Parcel " + parcelId + " was already collected on " + parcel.collectedAt + ".", "error");
        return;
    }
    if (parcel.status === "Pre-registered") {
        showMessage("verify-message", "Parcel " + parcelId + " has not been received at the gate yet.", "error");
        return;
    }
    if (parcel.pickupOtp !== otp) {
        showMessage("verify-message", "Wrong OTP. Parcel NOT handed over.", "error");
        return;
    }

    parcel.status = "Collected";
    parcel.collectedAt = nowText();
    saveList("parcels", parcels);

    showMessage("verify-message",
        "OTP verified. Parcel " + parcelId + " handed over to " + parcel.studentName + " (" + parcel.rollNo + ").",
        "success");
    document.getElementById("verify-form").reset();
    refreshGuardPage();
});

refreshGuardPage();
