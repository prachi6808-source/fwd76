const form = document.getElementById("find-form");
const tableBody = document.getElementById("parcel-rows");
let myParcels = [];

// Filters stored parcels by roll number & email, then updates summary cards and table
function showParcels(rollNo, email) {
    myParcels = getList("parcels").filter(function (p) {
        return p.rollNo === rollNo && p.email.toLowerCase() === email.toLowerCase();
    });

    const pending = myParcels.filter(function (p) { return p.status !== "Collected"; });
    const collected = myParcels.filter(function (p) { return p.status === "Collected"; });
    document.getElementById("stat-pending").textContent = pending.length;
    document.getElementById("stat-collected").textContent = collected.length;

    // Display the storage rack of the most recent parcel currently waiting at the gate
    const atGate = pending.filter(function (p) { return p.status === "At Main Gate"; });
    document.getElementById("stat-shelf").textContent =
        atGate.length > 0 ? atGate[atGate.length - 1].storage : "-";

    document.getElementById("details-message").style.display = "none";
    if (myParcels.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No parcels found for this roll number and email.</td></tr>';
        return;
    }

    let rows = "";
    myParcels.forEach(function (p, index) {
        const isCollected = p.status === "Collected";
        const statusText = p.status === "Pre-registered" ? "Awaiting Arrival" : p.status;
        const statusClass = isCollected ? "status-success" : "status-pending";
        const button = isCollected
            ? '<button class="btn-secondary" disabled>Collected</button>'
            : '<button class="btn-primary" data-index="' + index + '">View OTP / Details</button>';

        rows += "<tr>" +
            "<td>" + escapeHtml(p.id) + "</td>" +
            "<td>" + escapeHtml(p.courier) + "</td>" +
            "<td>" + escapeHtml(p.receivedAt || "Not arrived yet") + "</td>" +
            "<td>" + escapeHtml(p.storage) + "</td>" +
            '<td><span class="status ' + statusClass + '">' + escapeHtml(statusText) + "</span></td>" +
            "<td>" + button + "</td>" +
            "</tr>";
    });
    tableBody.innerHTML = rows;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const rollNo = getValue("my-roll").toUpperCase();
    const email = getValue("my-email");
    localStorage.setItem("myRoll", rollNo);
    localStorage.setItem("myEmail", email);
    showParcels(rollNo, email);
});

// Event delegation for per-row "View OTP / Details" buttons
tableBody.addEventListener("click", function (event) {
    const index = event.target.getAttribute("data-index");
    if (index === null) {
        return;
    }
    const p = myParcels[index];

    let text = "Parcel " + p.id + " | Courier: " + p.courier + " | Storage: " + p.storage;
    if (p.pickupOtp) {
        text += " | Your pickup OTP: " + p.pickupOtp;
    } else {
        text += " | Your pickup OTP will be emailed when the parcel reaches the gate.";
    }
    if (p.deliveryOtp) {
        text += " | Delivery OTP you gave the guard: " + p.deliveryOtp;
    }
    showMessage("details-message", text, "success");
});

// Auto-fill and load parcels if the student searched previously
const savedRoll = localStorage.getItem("myRoll");
const savedEmail = localStorage.getItem("myEmail");
if (savedRoll && savedEmail) {
    document.getElementById("my-roll").value = savedRoll;
    document.getElementById("my-email").value = savedEmail;
    showParcels(savedRoll, savedEmail);
}
