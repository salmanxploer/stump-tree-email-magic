# Netlify Deployment Guide

## What Was Fixed

The login issue on Netlify was caused by the app trying to connect to `http://localhost:4000` which doesn't exist in production. I've updated the system to:

1. **Gracefully fallback to mock data** when backend is not configured
2. **Remove hardcoded localhost API calls** - only calls backend if configured
3. **Use Firebase-only authentication** with local menu data
4. **Added proper Netlify configuration** for SPA routing

## Current Status

✅ Code has been pushed to GitHub
✅ App will use mock menu data (no backend calls)
✅ Authentication works with Firebase only
✅ No more localhost API errors on production
✅ Ready for immediate deployment to Netlify

## Netlify Configuration Steps

### 1. Set Environment Variables in Netlify

Go to your Netlify site dashboard → **Site settings** → **Environment variables** and add:

```
VITE_FIREBASE_API_KEY=AIzaSyD-mKaL8s2-s33ytnlfDI87HJa1SLNkW7Y
VITE_FIREBASE_AUTH_DOMAIN=bubt-2c983.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bubt-2c983
VITE_FIREBASE_APP_ID=1:3429281960:web:2aa327d61f11136d15929d
```

**Important**: Do NOT set `VITE_API_BASE_URL` unless you have a backend server deployed.

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

The app is configured to work **without a backend server**:

- **Menu items**: Uses built-in mock data (from `/src/data/mockData.ts`)
- **Authentication**: Firebase handles all user login/registration
- **Orders & Data**: Stored locally in browser localStorage (not persistent)
- **No API calls**: The app will not attempt to call `localhost:4000`

### To Enable Backend Later

If you deploy a backend server and want to enable it:

1. Deploy your backend to Render, Railway, Heroku, etc.
2. Set the environment variable in Netlify:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
3. The app will automatically use the backend for all API calls

## Future: Deploy Backend (Optional)

To get full functionality with persistent data (orders, menu management, invoices), you can deploy the backend server:

**Recommended platforms:**
- **Render.com** (free tier available, recommended)
- **Railway.app**
- **Heroku**
- **AWS EC2** or **DigitalOcean**

**After deploying your backend:**

1. Get your backend URL (e.g., `https://my-backend.onrender.com`)
2. Update the Netlify environment variable:
   ```
   VITE_API_BASE_URL=https://my-backend.onrender.com
   ```
3. Trigger a new deploy on Netlify
4. The app will now use your backend API

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
