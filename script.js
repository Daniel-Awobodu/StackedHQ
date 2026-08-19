/* ============================================
   STACKEDHQ Health Advisory — site behavior
   ============================================ */

// SET THIS to your n8n PRODUCTION webhook URL before you deploy.
//  - /webhook/... is the live URL. It only responds when the workflow
//    is Active (toggle in the top right of the n8n editor).
//  - /webhook-test/... only works while "Listen for test event" is
//    running in the editor. Use it for testing, not for the live site.
const N8N_WEBHOOK_URL = "https://danny010.app.n8n.cloud/webhook/bce04b7e-727a-4ab6-8005-d7c6564a2a83";

// ---- Footer year ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Elements ----
const form = document.getElementById("consultation-form");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("formStatus");
const receipt = document.getElementById("receipt");
const receiptCode = document.getElementById("receiptCode");

/* ---- Reference code ------------------------------------------------
   Made in the browser, sent with the request, and shown back to the
   person afterwards. The SAME code is reused if a send fails and they
   press the button again, so a retry is one request, not two.
   A fresh code is only made after a confirmed success.
   -------------------------------------------------------------------- */
function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0 or 1
  let tail = "";
  for (let i = 0; i < 6; i++) {
    tail += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2);
  return "SHQ-" + ymd + "-" + tail;
}

let reference = makeReference();

// ---- Field-level validation ----
function setInvalid(inputId, isInvalid) {
  const field = document.getElementById(inputId).closest(".field");
  field.classList.toggle("is-invalid", isInvalid);
  return !isInvalid;
}

function validate(values) {
  const okName = setInvalid("name", values.name.length < 1);
  const okEmail = setInvalid(
    "email",
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)
  );
  const okRequest = setInvalid("request", values.request.length < 20);
  return okName && okEmail && okRequest;
}

// ---- Submit ----
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Key names here MUST match what the n8n Code node reads.
  // snake_case, not camelCase.
  const payload = {
    submission_id: reference,
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    organization: document.getElementById("organization").value.trim(),
    request: document.getElementById("request").value.trim(),
    submitted_at: new Date().toISOString(),
    hp: document.getElementById("hp").value
  };

  if (!validate(payload)) {
    const firstBad = document.querySelector(".field.is-invalid input, .field.is-invalid textarea");
    if (firstBad) firstBad.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  statusEl.textContent = "";
  statusEl.classList.remove("status-success", "status-error");

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Webhook responded with status " + response.status);
    }

    receiptCode.textContent = reference;
    form.style.display = "none";
    receipt.classList.add("is-visible");
    receipt.scrollIntoView({ behavior: "smooth", block: "center" });

    // Confirmed success, so the next request gets a new code.
    form.reset();
    reference = makeReference();
  } catch (error) {
    console.error("Consultation form submission failed:", error);
    statusEl.textContent =
      "Something went wrong sending your request. Nothing was lost - press Send request to try again, or reach us at hello@stackedhq.example.";
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
