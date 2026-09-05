/* Living India — clean, standalone Supabase authentication UI */
(() => {
  const SUPABASE_URL = "https://nbxxknkecpnscirfnov.supabase.co";
  const SUPABASE_KEY = "sb_publishable_OxxgbDWRCVy3LPM69E_ydA_ybhkXURb";
  const SITE_URL = "https://ghostblade7.github.io/Sih/";

  let mode = "signin";
  let otpEmail = "";
  let busy = false;
  let root = null;

  const api = async (path, body) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || data.error_description || data.message || data.error || `Authentication error (${res.status})`);
    return data;
  };

  function styles() {
    if (document.getElementById("li-auth-clean-styles")) return;
    const s = document.createElement("style");
    s.id = "li-auth-clean-styles";
    s.textContent = `
      #li-auth-root{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,24,24,.76);backdrop-filter:blur(9px)}
      #li-auth-root.open{display:flex}
      .li-auth-card{position:relative;width:min(430px,calc(100vw - 36px));max-height:90vh;overflow:auto;box-sizing:border-box;padding:30px;background:#f8f2e6;color:#173c3b;border:1px solid #c7a45e;border-radius:22px;box-shadow:0 25px 90px rgba(0,0,0,.42);font-family:system-ui,-apple-system,sans-serif}
      .li-auth-close{position:absolute;right:13px;top:10px;border:0;background:transparent;color:#173c3b;font-size:28px;line-height:1;cursor:pointer}
      .li-auth-mark{text-align:center;font-size:30px}.li-auth-card h2{text-align:center;font:700 30px Georgia,serif;margin:7px 0}
      .li-auth-sub{text-align:center;color:#65706c;font-size:14px;line-height:1.45;margin:0 0 22px}
      .li-auth-card label{display:block;font-size:13px;font-weight:800;margin:12px 0 6px}
      .li-auth-card input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #cbc3b4;border-radius:11px;background:#fffdf9;color:#173c3b;font-size:15px;outline:none}
      .li-auth-card input:focus{border-color:#9b7433;box-shadow:0 0 0 3px rgba(155,116,51,.13)}
      .li-auth-submit,.li-auth-google{width:100%;box-sizing:border-box;padding:13px;border-radius:11px;font-weight:800;font-size:15px;cursor:pointer}
      .li-auth-submit{margin-top:18px;border:0;background:#173c3b;color:white}.li-auth-submit:disabled{opacity:.6}
      .li-auth-google{margin-top:10px;border:1px solid #bbb3a5;background:white;color:#173c3b}
      .li-auth-links{text-align:center;margin-top:16px;font-size:13px;color:#65706c}.li-auth-links button,.li-auth-forgot,.li-auth-back{border:0;background:none;color:#956c27;font-weight:800;cursor:pointer}
      .li-auth-forgot,.li-auth-back{display:block;margin-top:10px;padding:0;font-size:12px}
      .li-auth-divider{display:flex;align-items:center;gap:10px;margin:17px 0;color:#8a8a84;font-size:11px}.li-auth-divider:before,.li-auth-divider:after{content:"";height:1px;background:#d8d0c2;flex:1}
      .li-auth-msg{min-height:21px;margin-top:12px;text-align:center;font-size:13px;font-weight:700;line-height:1.4}
      .li-auth-otp{letter-spacing:8px;text-align:center;font-weight:800;font-size:21px}
    `;
    document.head.appendChild(s);
  }

  function mount() {
    if (root) return;
    styles();
    root = document.createElement("div");
    root.id = "li-auth-root";
    root.innerHTML = `<div class="li-auth-card" role="dialog" aria-modal="true">
      <button class="li-auth-close" aria-label="Close">×</button>
      <div class="li-auth-mark">✺</div>
      <h2>Living India</h2>
      <p class="li-auth-sub" id="li-auth-title"></p>
      <div id="li-auth-fields"></div>
      <button class="li-auth-submit" id="li-submit"></button>
      <div id="li-auth-extra"></div>
      <div class="li-auth-msg" id="li-msg"></div>
    </div>`;
    document.body.appendChild(root);
    root.addEventListener("click", e => { if (e.target === root || e.target.closest(".li-auth-close")) close(); });
    root.querySelector("#li-submit").addEventListener("click", submit);
    render();
  }

  function msg(text, error=false) {
    const el = document.getElementById("li-msg");
    if (el) { el.textContent = text; el.style.color = error ? "#a23d31" : "#52725f"; }
  }

  function render() {
    if (!root) return;
    const fields = document.getElementById("li-auth-fields");
    const extra = document.getElementById("li-auth-extra");
    const title = document.getElementById("li-auth-title");
    const submitBtn = document.getElementById("li-submit");

    if (mode === "otp") {
      title.textContent = `We sent a 6-digit verification code to ${otpEmail}.`;
      fields.innerHTML = `<label>Verification code</label><input id="li-otp" class="li-auth-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456">`;
      submitBtn.textContent = "Verify Email";
      extra.innerHTML = `<button class="li-auth-back" id="li-otp-back">Back to sign up</button>`;
      extra.querySelector("#li-otp-back").onclick = () => { mode = "signup"; render(); };
      return;
    }

    if (mode === "reset") {
      title.textContent = "Create a new password.";
      fields.innerHTML = `<label>New password</label><input id="li-password" type="password" autocomplete="new-password" placeholder="At least 6 characters"><label>Confirm new password</label><input id="li-confirm" type="password" autocomplete="new-password" placeholder="Repeat your password">`;
      submitBtn.textContent = "Update Password";
      extra.innerHTML = `<button class="li-auth-back" id="li-reset-back">Back to sign in</button>`;
      extra.querySelector("#li-reset-back").onclick = () => { mode = "signin"; render(); };
      return;
    }

    const signup = mode === "signup";
    title.textContent = signup ? "Create your account and start exploring." : "Welcome back — sign in to continue.";
    fields.innerHTML = `${signup ? `<label>Name</label><input id="li-name" type="text" autocomplete="name" placeholder="Your name">` : ""}
      <label>Email</label><input id="li-email" type="email" autocomplete="email" placeholder="you@example.com">
      <label>Password</label><input id="li-password" type="password" autocomplete="current-password" placeholder="At least 6 characters">
      ${signup ? `<label>Confirm password</label><input id="li-confirm" type="password" autocomplete="new-password" placeholder="Repeat your password">` : ""}`;
    submitBtn.textContent = signup ? "Create Account" : "Sign In";
    extra.innerHTML = signup
      ? `<div class="li-auth-divider">OR</div><button class="li-auth-google" id="li-google">Continue with Google</button><div class="li-auth-links">Already have an account? <button id="li-switch">Sign in</button></div>`
      : `<button class="li-auth-forgot" id="li-forgot">Forgot password?</button><div class="li-auth-divider">OR</div><button class="li-auth-google" id="li-google">Continue with Google</button><div class="li-auth-links">New here? <button id="li-switch">Create an account</button></div>`;
    extra.querySelector("#li-switch").onclick = () => { mode = signup ? "signin" : "signup"; render(); };
    extra.querySelector("#li-google").onclick = google;
    extra.querySelector("#li-forgot")?.addEventListener("click", () => { mode = "forgot"; render(); });
  }

  // Forgot-password is rendered as a simple email-only state.
  const oldRender = render;
  render = function() {
    if (mode !== "forgot") return oldRender();
    const fields = document.getElementById("li-auth-fields"), extra = document.getElementById("li-auth-extra");
    document.getElementById("li-auth-title").textContent = "We'll send a password reset link to your email.";
    fields.innerHTML = `<label>Email</label><input id="li-email" type="email" autocomplete="email" placeholder="you@example.com">`;
    document.getElementById("li-submit").textContent = "Send Reset Link";
    extra.innerHTML = `<button class="li-auth-back" id="li-forgot-back">Back to sign in</button>`;
    extra.querySelector("#li-forgot-back").onclick = () => { mode = "signin"; render(); };
  };

  async function submit() {
    if (busy) return;
    busy = true;
    const button = document.getElementById("li-submit");
    button.disabled = true;
    try {
      if (mode === "otp") {
        const token = (document.getElementById("li-otp")?.value || "").replace(/\D/g,"");
        if (token.length !== 6) throw new Error("Enter the 6-digit code from your email.");
        await api("verify", { type:"signup", email:otpEmail, token });
        msg("Email verified! Welcome to Living India.");
        setTimeout(close, 900);
        return;
      }
      if (mode === "forgot") {
        const email = document.getElementById("li-email")?.value.trim();
        if (!email) throw new Error("Enter your email first.");
        await api("recover", { email, redirect_to:SITE_URL });
        msg("Password reset email sent. Check your inbox.");
        return;
      }
      if (mode === "reset") {
        msg("Please use the password reset link from your email to finish setting a new password.");
        return;
      }
      const email = document.getElementById("li-email")?.value.trim();
      const password = document.getElementById("li-password")?.value || "";
      if (!email || password.length < 6) throw new Error("Enter a valid email and a password of at least 6 characters.");
      if (mode === "signup") {
        const name = document.getElementById("li-name")?.value.trim();
        const confirm = document.getElementById("li-confirm")?.value || "";
        if (!name) throw new Error("Please enter your name.");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const data = await api("signup", { email, password, data:{full_name:name}, redirect_to:SITE_URL });
        if (data.user) { otpEmail = email; mode = "otp"; render(); msg("Check your email for the 6-digit code."); }
      } else {
        const data = await api("token?grant_type=password", { email, password });
        try { localStorage.setItem("li_session", JSON.stringify(data)); } catch {}
        msg("Signed in successfully!");
        setTimeout(close, 700);
      }
    } catch (e) {
      msg(e.message || "Authentication failed.", true);
    } finally {
      busy = false;
      button.disabled = false;
    }
  }

  function google() {
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(SITE_URL)}&apikey=${encodeURIComponent(SUPABASE_KEY)}`;
    window.location.href = url;
  }

  function open(which="signin") {
    mount();
    mode = which;
    root.classList.add("open");
    document.body.style.overflow = "hidden";
    render();
    setTimeout(() => root.querySelector("input")?.focus(), 50);
  }

  function close() {
    if (!root) return;
    root.classList.remove("open");
    document.body.style.overflow = "";
    msg("");
  }

  window.LivingIndiaAuthOpen = open;
  window.LivingIndiaAuthClose = close;

  function init() {
    mount();
    // Direct delegated handler makes both the sidebar Login and avatar reliable.
    document.addEventListener("click", e => {
      const b = e.target.closest?.("button");
      if (!b) return;
      const text = (b.textContent || "").replace(/\s+/g," ").trim();
      if (b.classList.contains("avatar") || /^♙?\s*Login$/i.test(text)) {
        e.preventDefault();
        e.stopPropagation();
        open("signin");
      }
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
