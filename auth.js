import { auth, subscribeToAuth } from './firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const body = document.getElementById('auth-body');
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMsg = document.getElementById('error-msg');

// Route guarding: If already logged in, redirect to profile immediately.
subscribeToAuth((user) => {
  if (user) {
    window.location.href = '/profile.html';
  } else {
    body.classList.remove('auth-hidden'); // Show page only if logged out
  }
});

// 1. Email/Password Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    errorMsg.textContent = 'Authenticating...';
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// 2. Google Login
const provider = new GoogleAuthProvider();
googleLoginBtn.addEventListener('click', async () => {
  try {
    errorMsg.textContent = 'Opening Google Sign-In...';
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will trigger and redirect to profile on success
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
