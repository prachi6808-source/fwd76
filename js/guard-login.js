const lockBox = document.getElementById("guard-lock");
const contentBox = document.getElementById("guard-content");

function openGuardPanel() {
    lockBox.style.display = "none";
    contentBox.style.display = "block";
}

// Keep the guard unlocked across page refreshes in the same tab
if (sessionStorage.getItem("guardOpen") === "yes") {
    openGuardPanel();
}

document.getElementById("pin-form").addEventListener("submit", function (event) {
    event.preventDefault();
    if (getValue("pin-input") === GUARD_PIN) {
        sessionStorage.setItem("guardOpen", "yes");
        openGuardPanel();
    } else {
        showMessage("pin-message", "Wrong PIN. Try again.", "error");
        document.getElementById("pin-form").reset();
    }
});

document.getElementById("guard-logout").addEventListener("click", function () {
    sessionStorage.removeItem("guardOpen");
    window.location.reload();
});
