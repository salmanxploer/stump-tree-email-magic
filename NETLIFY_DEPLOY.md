# Netlify Deployment Guide

## What Was Fixed

The login issue on Netlify was caused by the app trying to connect to `http://localhost:4000` which doesn't exist in production. I've updated the authentication system to:

1. **Gracefully fallback to Firebase-only mode** when the backend is unavailable
2. **Use Firebase user data** directly instead of requiring backend sync
3. **Added proper Netlify configuration** for SPA routing

## Current Status

✅ Your code has been pushed to GitHub
✅ Authentication will now work on Netlify without a backend server
✅ Users can login, register, and use the app

## Netlify Configuration Steps

### 1. Set Environment Variables in Netlify

Go to your Netlify site dashboard → **Site settings** → **Environment variables** and add:

```
VITE_FIREBASE_API_KEY=AIzaSyD-mKaL8s2-s33ytnlfDI87HJa1SLNkW7Y
VITE_FIREBASE_AUTH_DOMAIN=bubt-2c983.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bubt-2c983
VITE_FIREBASE_APP_ID=1:3429281960:web:2aa327d61f11136d15929d
```

### 2. Trigger a New Deploy

Since the code is already pushed, Netlify should automatically rebuild. If not:
- Go to **Deploys** tab
- Click **Trigger deploy** → **Deploy site**

### 3. Add Your Domain to Firebase

To enable authentication on your Netlify domain:

1. Go to [Firebase Console](https://console.firebase.google.com/project/bubt-2c983/authentication/settings)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add your Netlify domain: `bubt-cafe.netlify.app`

## How It Works Now

- **With backend**: If you deploy a backend server later, the app will sync with it
- **Without backend**: The app works in Firebase-only mode with these limitations:
  - User data stored in Firebase only
  - Role defaults to "customer" for new registrations
  - No persistent menu items, orders, or invoices (unless you add Firebase Firestore)

## Future: Deploy Backend (Optional)

To get full functionality (orders, menu management, invoices), deploy the backend server to:

- **Render.com** (recommended, free tier available)
- **Railway.app**
- **Heroku**
- **Vercel/Netlify Functions**

Once deployed, update the environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

## Testing

After deployment, test:
1. ✅ Registration with email/password
2. ✅ Login with email/password
3. ✅ Google Sign-in (if configured)
4. ✅ Password reset
5. ✅ Navigation after login

## Need Help?

If you still have issues after deploying:
1. Check the browser console for errors
2. Verify environment variables are set in Netlify
3. Ensure Firebase has your domain authorized
4. Check Netlify deploy logs for build errors
