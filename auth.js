import { auth, subscribeToAuth } from './firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

const body = document.getElementById('auth-body');
const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

// Route guarding: If already logged in, redirect to profile immediately.
subscribeToAuth((user) => {
  if (user) {
    window.location.href = '/profile.html';
  } else {
    body.classList.remove('auth-hidden'); // Show page only if logged out
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    errorMsg.textContent = 'Authenticating...';
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will trigger and redirect to profile
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
