// Handle online shopping parcel pre-registration (requires delivery OTP)
document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = document.getElementById("register-btn");
    button.disabled = true;
    button.textContent = "Saving...";

    const parcels = getList("parcels");
    const parcel = {
        id: generateId("CP", parcels),
        type: "delivery",
        studentName: getValue("r-name"),
        rollNo: getValue("r-roll").toUpperCase(),
        email: getValue("r-email"),
        phone: getValue("r-phone"),
        courier: getValue("r-courier"),
        deliveryOtp: getValue("r-otp"),
        pickupOtp: "",
        instructions: getValue("r-instructions") || "None",
        storage: "Not stored yet",
        status: "Pre-registered",
        createdAt: nowText(),
        receivedAt: ""
    };

    parcels.push(parcel);
    saveList("parcels", parcels);

    // Notify both the student and the guard desk so the delivery OTP is accessible across devices
    const text = "Hello " + parcel.studentName + ",\n\n" +
        "Your parcel from " + parcel.courier + " is registered.\n" +
        "Parcel ID: " + parcel.id + "\n\n" +
        "The guard has your delivery OTP. When the parcel reaches the gate, " +
        "you will get a second OTP by email. Show that OTP to the guard to collect it.\n- CampusParcel";
    const sent = await sendEmail(parcel.email, "CampusParcel: Parcel " + parcel.id + " registered", text);

    const studentNote = emailNote(sent, parcel.email);
    const guardText = "New pre-registered parcel " + parcel.id + "\n\n" +
        "Student: " + parcel.studentName + " (" + parcel.rollNo + ")\n" +
        "Phone: " + parcel.phone + "\n" +
        "Email: " + parcel.email + "\n" +
        "Courier: " + parcel.courier + "\n" +
        "DELIVERY OTP: " + parcel.deliveryOtp + "\n" +
        "Instructions: " + parcel.instructions + "\n\n" +
        "Give this delivery OTP to the delivery person to collect the parcel.";
    const guardSent = await sendEmail(EMAILJS_CONFIG.guardEmail, "CampusParcel: delivery OTP for " + parcel.id, guardText);
    const guardNote = guardSent
        ? "The guard desk was emailed your delivery OTP."
        : "The guard desk could not be emailed, so the guard can only see it on the Guard Panel in this browser.";

    showMessage("register-message",
        "Parcel registered! Your Parcel ID is " + parcel.id + ". " + studentNote + " " + guardNote,
        sent && guardSent ? "success" : "warning");

    document.getElementById("register-form").reset();
    button.disabled = false;
    button.textContent = "Register Parcel";
});

// Handle personal / friend-or-family parcel pre-registration (no delivery OTP needed)
document.getElementById("family-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = document.getElementById("family-btn");
    button.disabled = true;
    button.textContent = "Saving...";

    const parcels = getList("parcels");
    const parcel = {
        id: generateId("CP", parcels),
        type: "family",
        studentName: getValue("f-student"),
        rollNo: getValue("f-roll").toUpperCase(),
        email: getValue("f-email"),
        phone: getValue("f-phone"),
        courier: "From " + getValue("f-name"),
        deliveryOtp: "",
        pickupOtp: "",
        instructions: getValue("f-instructions") || "None",
        storage: "Not stored yet",
        status: "Pre-registered",
        createdAt: nowText(),
        receivedAt: ""
    };

    parcels.push(parcel);
    saveList("parcels", parcels);

    const text = "Hello " + parcel.studentName + ",\n\n" +
        "A parcel is coming for you " + parcel.courier.toLowerCase() + ".\n" +
        "Parcel ID: " + parcel.id + "\n\n" +
        "When it reaches the gate you will get an OTP by email. Show it to the guard to collect it.\n- CampusParcel";
    const sent = await sendEmail(parcel.email, "CampusParcel: Parcel " + parcel.id + " is on its way", text);

    const studentNote2 = emailNote(sent, parcel.email);
    const guardText2 = "New pre-registered parcel " + parcel.id + " (from family / friend)\n\n" +
        "Student: " + parcel.studentName + " (" + parcel.rollNo + ")\n" +
        "Sender: " + parcel.courier + ", phone " + parcel.phone + "\n" +
        "Student email: " + parcel.email + "\n" +
        "Instructions: " + parcel.instructions;
    const guardSent2 = await sendEmail(EMAILJS_CONFIG.guardEmail, "CampusParcel: parcel " + parcel.id + " is expected", guardText2);

    showMessage("family-message",
        "Details saved! Your Parcel ID is " + parcel.id + ". " + studentNote2 + (guardSent2 ? " The guard desk was emailed." : ""),
        sent && guardSent2 ? "success" : "warning");

    document.getElementById("family-form").reset();
    button.disabled = false;
    button.textContent = "Submit";
});
