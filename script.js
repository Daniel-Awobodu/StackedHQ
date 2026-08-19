/* ============================================
   STACKEDHQ Health Advisory — site behavior
   ============================================ */

// 1. SET THIS to your n8n PRODUCTION webhook URL before you deploy.
//    - It should look like: https://your-n8n-domain.com/webhook/xxxxxxxx
//    - NOT the "/webhook-test/" URL — that one only works while the
//      workflow is open and listening in the n8n editor.
//    - The n8n workflow must be Active (toggled on) for the production
//      URL to respond.
const N8N_WEBHOOK_URL = "https://danny010.app.n8n.cloud/webhook/bce04b7e-727a-4ab6-8005-d7c6564a2a83";

// ---- Footer year ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Consultation form submit ----
const form = document.getElementById("consultation-form");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.submittedAt = new Date().toISOString();
  payload.source = "stackedhq-health-advisory-website";

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  statusEl.textContent = "";
  statusEl.classList.remove("status-success", "status-error");

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }

    form.reset();
    statusEl.textContent = "Request received. We'll be in touch within one business day.";
    statusEl.classList.add("status-success");
  } catch (error) {
    console.error("Consultation form submission failed:", error);
    statusEl.textContent =
      "Something went wrong sending your request. Please try again, or reach us directly at hello@stackedhq.example.";
    statusEl.classList.add("status-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
  }
});

// ---- Gentle scroll reveal (skipped entirely if reduced motion is set) ----
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}
