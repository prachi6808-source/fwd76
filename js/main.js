// Shared helpers for localStorage persistence, ID/OTP generation, DOM updates, and EmailJS

function getList(key) {
    const saved = localStorage.getItem(key);
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

// Generates a collision-free ID formatted as #<PREFIX>-<4-digit-number>
function generateId(prefix, list) {
    let id;
    let alreadyUsed = true;
    while (alreadyUsed) {
        id = "#" + prefix + "-" + Math.floor(1000 + Math.random() * 9000);
        alreadyUsed = list.some(function (item) {
            return item.id === id;
        });
    }
    return id;
}

// Normalizes user-entered parcel IDs (e.g. "cp-9021" -> "#CP-9021")
function cleanParcelId(text) {
    let id = text.trim().toUpperCase();
    if (id.charAt(0) !== "#") {
        id = "#" + id;
    }
    return id;
}

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function nowText() {
    return new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// Sanitizes dynamic user input before injecting into innerHTML
function escapeHtml(text) {
    const temp = document.createElement("div");
    temp.textContent = text;
    return temp.innerHTML;
}

function showMessage(boxId, text, type) {
    const box = document.getElementById(boxId);
    box.className = "message " + type;
    box.textContent = text;
    box.style.display = "block";
}

function emailIsConfigured() {
    return EMAILJS_CONFIG.publicKey.indexOf("YOUR_") !== 0 &&
           EMAILJS_CONFIG.serviceId.indexOf("YOUR_") !== 0 &&
           EMAILJS_CONFIG.templateId.indexOf("YOUR_") !== 0;
}

let lastEmailError = "";

// Dispatches an email via EmailJS REST API and records any failure reason in lastEmailError
async function sendEmail(toEmail, subject, message) {
    lastEmailError = "";

    if (!emailIsConfigured()) {
        lastEmailError = "EmailJS keys are not set in js/config.js yet";
        return false;
    }

    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: EMAILJS_CONFIG.serviceId,
                template_id: EMAILJS_CONFIG.templateId,
                user_id: EMAILJS_CONFIG.publicKey,
                template_params: {
                    to_email: toEmail,
                    subject: subject,
                    message: message
                }
            })
        });
        if (response.ok) {
            return true;
        }
        lastEmailError = "EmailJS replied: " + (await response.text());
        return false;
    } catch (error) {
        lastEmailError = "Could not reach EmailJS (check the internet connection)";
        return false;
    }
}

function emailNote(sent, toEmail) {
    if (sent) {
        return "Email sent to " + toEmail + ".";
    }
    return "Email NOT sent (" + lastEmailError + ").";
}
