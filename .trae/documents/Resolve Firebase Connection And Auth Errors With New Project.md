## Overview
We’ll fix the infinite “Auth/Firestore: checking”, the “Connection failed” notice, and the “auth/invalid-credential” login error by tightening Firebase setup, hardening the AuthContext, and making routing/loading states deterministic. We’ll also ensure your new Firebase project (bubt-2c983) is used everywhere and the register/login screens are responsive.

## Console Actions (Required in Firebase)
- Auth → Settings → Authorized domains: add `localhost` and `localhost:8080`.
- Auth → Sign-in method: enable “Email/Password”. Keep Google Sign-in enabled if you want Google login.
- Firestore → Rules (development-safe baseline):
```
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    // Admin reads staff list (temp dev rule – tighten later):
    match /users/{document=**} {
      allow read: if true;
    }
  }
}
```
- Optional: if Google sign-in is desired in web, no SHA-1 needed; SHA-1 note applies to Android.

## Code Changes
- Firebase config
  - Replace config with your new project values (already prepared) and keep long-polling + IndexedDB persistence for reliability.
- AuthContext
  - Add `authReady` flag set after first `onAuthStateChanged` resolves.
  - When Firestore profile read fails, create a minimal fallback profile and still sign the user in (no silent null).
  - Keep admin bootstrap on first login with `admin@bubt.edu` / `admin1234`. If `auth/invalid-credential` occurs for admin, show a clear message to reset password in Firebase console.
  - Improve login/register error messages for `network-request-failed`, `invalid-email`, `wrong-password`, `email-already-in-use`, `weak-password`.
- ProtectedRoute
  - Use `authReady` instead of a fixed 100ms timeout; show a small loader until auth state is known; then apply role checks and staff approval gating.
- FirebaseStatus (diagnostics)
  - Ensure it sets both Auth and Firestore states to `error` on any exception, never stays in “checking”.
  - Make it dev-only (`import.meta.env.DEV`) so it won’t distract production users.
- Register/Login screens
  - Confirm forms don’t block on diagnostics; buttons show spinners and stay interactive.
  - After successful registration: sign out and redirect to `/login`. Staff sees “pending admin approval”.

## Invalid Credential Fix Strategy
- If you see `auth/invalid-credential`:
  - For normal users: it means wrong email/password; show precise message.
  - For the admin email: if the account already exists with a different password, the client cannot override it; reset the password in Firebase console to `admin1234` to match the predefined credentials.

## Verification
- Run dev server and verify FirebaseStatus reports Connected (in dev only).
- Register as customer → redirected to login → login succeeds.
- Register as staff → blocked until admin approves.
- Login as admin (`admin@bubt.edu` / `admin1234`) → Admin dashboard shows pending staff; approve staff → staff can log in.
- No infinite “checking”; no net::ERR_ABORTED; clear error messages when credentials are wrong or network fails.

## Optional: Google Sign-In
- If desired, enable a “Continue with Google” button using `GoogleAuthProvider` and `signInWithPopup(auth, provider)`. This uses the project’s Web Client ID automatically; no extra code needed beyond the provider.

## Deliverables
- Updated `firebase.ts`, hardened `AuthContext`, corrected `ProtectedRoute`, dev-only `FirebaseStatus`, responsive login/register.

Please confirm and I’ll apply the changes and run verification end-to-end. 