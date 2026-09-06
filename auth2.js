import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  reload
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCeuizWkJRvp2_iOxD4UOFL12Os2k0KybQ',
  authDomain: 'living-india-7f73b.firebaseapp.com',
  projectId: 'living-india-7f73b',
  storageBucket: 'living-india-7f73b.firebasestorage.app',
  messagingSenderId: '439601825953',
  appId: '1:439601825953:web:cc38c29d819b86de03c8e0',
  measurementId: 'G-N76WYJXS7K'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
setPersistence(auth, browserLocalPersistence).catch(() => {})

const $ = id => document.getElementById(id)
const home = new URL('./', location.href).href
let state = 'signin'
let pendingEmail = sessionStorage.getItem('li-pending-email') || ''

function friendlyError(err) {
  const code = String(err?.code || '')
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-login-credentials': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-blocked': 'Google sign-in was blocked by the browser. Please try again.',
    'auth/network-request-failed': 'Cannot reach the account service. Please check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
    'auth/unauthorized-domain': 'This website domain is not authorised in Firebase.'
  }
  return messages[code] || String(err?.message || err || 'Something went wrong. Please try again.')
}

function status(text, ok = false) {
  const el = $('status')
  if (el) {
    el.textContent = text
    el.className = 'status ' + (ok ? 'ok' : '')
  }
}

function showPass() {
  const x = $('password')
  if (!x) return
  x.type = x.type === 'password' ? 'text' : 'password'
  document.querySelectorAll('.show').forEach(b => { b.textContent = x.type === 'password' ? 'Show' : 'Hide' })
}

function wireLinks() {
  $('links')?.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.mode))
  })
}

function render(next) {
  state = next
  const signup = next === 'signup'
  const reset = next === 'reset'
  const verify = next === 'verify'
  const recovery = next === 'recovery'

  $('ey').textContent = recovery ? 'SECURE ACCOUNT' : reset ? 'ACCOUNT RECOVERY' : signup ? 'JOIN THE ARCHIVE' : verify ? 'EMAIL VERIFICATION' : 'WELCOME BACK'
  $('title').textContent = recovery ? 'Check your email' : reset ? 'Reset password' : signup ? 'Create your account' : verify ? 'Verify your email' : 'Sign in'
  $('sub').textContent = recovery ? 'Use the secure link in your email to choose a new password.' : reset ? 'Enter your email and we will send a password reset link.' : signup ? 'Create an account and verify your email before entering Living India.' : verify ? 'We sent a verification link to your email. Open it, then return here.' : 'Sign in to save discoveries, collect heritage stamps and share stories.'

  $('nameBox').classList.toggle('hidden', !signup)
  $('emailBox').classList.toggle('hidden', verify || recovery)
  $('passBox').classList.toggle('hidden', reset || verify || recovery)
  $('confirmBox').classList.toggle('hidden', !signup && !recovery)
  $('google').classList.toggle('hidden', reset || verify || recovery)
  $('otpNote').classList.toggle('hidden', !verify)
  if (verify) $('otpNote').textContent = 'A verification link has been sent to your email.'

  $('links').innerHTML = (reset || verify || recovery)
    ? '<button type="button" data-mode="signin">Back to sign in</button>'
    : signup
      ? '<button type="button" data-mode="signin">Already have an account?</button>'
      : '<button type="button" data-mode="signup">Create account</button><button type="button" data-mode="reset">Forgot password?</button>'
  wireLinks()

  if (verify) {
    $('form').innerHTML = '<label>EMAIL</label><input id="verifyEmail" type="email" readonly><button class="primary" id="verifyBtn" type="submit">I have verified my email →</button><button class="secondary" id="resendBtn" type="button">Resend verification email</button>'
    $('verifyEmail').value = pendingEmail
  } else if (recovery) {
    $('form').innerHTML = '<p class="sub" style="margin-top:0">Open the reset link from your email to return here and set a new password.</p>'
    $('submit').textContent = 'Continue →'
  } else {
    $('submit').textContent = reset ? 'Send reset link →' : signup ? 'Create account →' : 'Sign in →'
  }

  $('form').onsubmit = submit
  $('resendBtn')?.addEventListener('click', resendVerification)
  status('')
}

async function submit(e) {
  e.preventDefault()
  const btn = $('submit') || $('verifyBtn')
  if (btn) btn.disabled = true
  status('Connecting…')

  try {
    if (state === 'signin') {
      const credential = await signInWithEmailAndPassword(auth, $('email').value.trim(), $('password').value)
      await reload(credential.user)
      if (!credential.user.emailVerified) {
        pendingEmail = credential.user.email || ''
        sessionStorage.setItem('li-pending-email', pendingEmail)
        await signOut(auth)
        render('verify')
        status('Please verify your email first. Check your inbox.', true)
        return
      }
      location.href = home
      return
    }

    if (state === 'signup') {
      const password = $('password').value
      if (password !== $('confirm').value) throw new Error('Passwords do not match.')
      pendingEmail = $('email').value.trim()
      const credential = await createUserWithEmailAndPassword(auth, pendingEmail, password)
      const fullName = $('name').value.trim()
      if (fullName) await updateProfile(credential.user, { displayName: fullName })
      await sendEmailVerification(credential.user)
      sessionStorage.setItem('li-pending-email', pendingEmail)
      await signOut(auth)
      render('verify')
      status('Verification email sent. Check your inbox, then return here.', true)
      return
    }

    if (state === 'verify') {
      const email = $('verifyEmail').value.trim()
      if (!email) throw new Error('Your email address is missing.')
      // Firebase email verification is link-based. Sign in briefly to refresh
      // the user state, then continue only when emailVerified is true.
      const password = sessionStorage.getItem('li-verify-password')
      if (!password) {
        status('After clicking the verification link, sign in with your email and password to continue.', true)
        render('signin')
        return
      }
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await reload(credential.user)
      if (!credential.user.emailVerified) {
        await signOut(auth)
        throw new Error('Email is not verified yet. Open the verification email and try again.')
      }
      sessionStorage.removeItem('li-pending-email')
      sessionStorage.removeItem('li-verify-password')
      location.href = home
      return
    }

    if (state === 'reset') {
      await sendPasswordResetEmail(auth, $('email').value.trim())
      status('Password reset email sent. Check your inbox.', true)
      return
    }

    if (state === 'recovery') {
      location.href = loginUrl + '?reset=1'
    }
  } catch (err) {
    console.error('[Living India Firebase Auth]', err)
    status(friendlyError(err))
  } finally {
    if ($('submit')) $('submit').disabled = false
    if ($('verifyBtn')) $('verifyBtn').disabled = false
  }
}

async function resendVerification() {
  const email = pendingEmail || $('verifyEmail')?.value?.trim()
  if (!email) return status('Enter your email first.')
  status('Preparing a new verification email…')
  const password = sessionStorage.getItem('li-verify-password')
  if (!password) {
    status('Please sign in first so Firebase can send a new verification email.')
    render('signin')
    return
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(credential.user)
    await signOut(auth)
    status('A new verification email has been sent.', true)
  } catch (err) {
    status(friendlyError(err))
  }
}

async function googleLogin() {
  status('Opening Google sign-in…')
  try {
    await signInWithRedirect(auth, googleProvider)
  } catch (err) {
    console.error('[Living India Firebase Google]', err)
    status(friendlyError(err))
  }
}

$('back')?.addEventListener('click', () => { location.href = home })
$('showPass')?.addEventListener('click', showPass)
$('googleBtn')?.addEventListener('click', googleLogin)
$('form')?.addEventListener('submit', submit)

;(async () => {
  const params = new URLSearchParams(location.search)
  const reset = params.get('reset') === '1'
  render(params.get('mode') === 'signup' ? 'signup' : 'signin')

  try {
    const redirectResult = await getRedirectResult(auth)
    if (redirectResult?.user) {
      location.href = home
      return
    }
  } catch (err) {
    console.error('[Living India Firebase Redirect]', err)
    status(friendlyError(err))
  }

  onAuthStateChanged(auth, async user => {
    if (!user) return
    try {
      await reload(user)
      if (reset) return
      if (user.providerData.some(p => p.providerId === 'google.com') || user.emailVerified) {
        location.href = home
      }
    } catch (err) {
      console.error('[Living India Firebase Session]', err)
    }
  })
})()
