document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("updateForm");
  const submitBtn = document.getElementById("submitBtn");

  // Optional: disable the button initially just to be sure
  submitBtn.disabled = true;

  form.addEventListener("input", () => {
    // Check all required fields
    const requiredFields = form.querySelectorAll("[required]");
    const allFilled = Array.from(requiredFields).every(field => field.value.trim() !== "");

    // Enable/disable the submit button based on form completeness
    submitBtn.disabled = !allFilled;
  });
});

