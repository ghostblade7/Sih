<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login | Living India</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/auth.css">
  </head>
  <body class="auth-hidden" id="auth-body">
    <div class="auth-container ornamental-border">
      <h2>Welcome Back</h2>
      <p class="subtitle">Continue your heritage journey.</p>
      
      <form id="login-form">
        <input type="email" id="email" placeholder="Email Address" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit" class="btn-primary" style="width: 100%;">Sign In</button>
      </form>
      <div id="error-msg" style="color: var(--accent-terracotta); margin-top: 10px; text-align: center;"></div>
      
      <p style="text-align: center; margin-top: 24px; font-family: var(--font-sans); font-size: 14px;">
        <a href="/" style="color: var(--primary-teal);">← Back to Living India</a>
      </p>
    </div>
    <script type="module" src="/auth.js"></script>
  </body>
</html>
