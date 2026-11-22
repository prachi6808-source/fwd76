// Save complaint ticket to localStorage and notify support via EmailJS
document.getElementById("complaint-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = document.getElementById("complaint-btn");
    button.disabled = true;
    button.textContent = "Submitting...";

    const dropdown = document.getElementById("issue-type");
    const issueText = dropdown.options[dropdown.selectedIndex].text;

    const complaints = getList("complaints");
    const complaint = {
        id: generateId("TKT", complaints),
        rollNo: getValue("complaint-student-id").toUpperCase(),
        email: getValue("complaint-email"),
        parcelId: getValue("parcel-id") || "Not given",
        issue: issueText,
        description: getValue("complaint-desc"),
        createdAt: nowText()
    };
    complaints.push(complaint);
    saveList("complaints", complaints);

    const text = "New complaint " + complaint.id + "\n\n" +
        "Student: " + complaint.rollNo + " (" + complaint.email + ")\n" +
        "Parcel ID: " + complaint.parcelId + "\n" +
        "Issue: " + complaint.issue + "\n" +
        "Details: " + complaint.description;
    const sent = await sendEmail(EMAILJS_CONFIG.supportEmail, "CampusParcel complaint " + complaint.id, text);

    if (sent) {
        showMessage("complaint-message", "Complaint " + complaint.id + " submitted. The support team has been emailed.", "success");
    } else {
        showMessage("complaint-message", "Complaint " + complaint.id + " saved. (Email was not sent - see README.)", "warning");
    }

    document.getElementById("complaint-form").reset();
    button.disabled = false;
    button.textContent = "Submit Complaint";
});

// Save user feedback/rating and email a copy to support
document.getElementById("feedback-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = document.getElementById("feedback-btn");
    button.disabled = true;
    button.textContent = "Submitting...";

    const feedbackList = getList("feedback");
    const feedback = {
        id: generateId("FB", feedbackList),
        name: getValue("reviewer-name"),
        rating: getValue("user-rating"),
        comments: getValue("feedback-comments"),
        createdAt: nowText()
    };
    feedbackList.push(feedback);
    saveList("feedback", feedbackList);

    const text = "New feedback " + feedback.id + "\n\n" +
        "From: " + feedback.name + "\n" +
        "Rating: " + feedback.rating + " / 5\n" +
        "Comments: " + feedback.comments;
    const sent = await sendEmail(EMAILJS_CONFIG.supportEmail, "CampusParcel feedback " + feedback.id, text);

    if (sent) {
        showMessage("feedback-message", "Thank you! Your feedback was submitted.", "success");
    } else {
        showMessage("feedback-message", "Thank you! Your feedback was saved. (Email was not sent - see README.)", "warning");
    }

    document.getElementById("feedback-form").reset();
    button.disabled = false;
    button.textContent = "Submit Feedback";
});
