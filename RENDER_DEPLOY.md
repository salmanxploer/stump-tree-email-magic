# Deploy Backend to Render.com

This guide helps you deploy the BUBT Cafeteria backend server to Render.com for free.

## Prerequisites

1. A [Render.com](https://render.com) account (sign up with GitHub)
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (free tier available)
3. Google OAuth credentials (from Google Cloud Console)

---

## Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bubt-cafe?retryWrites=true&w=majority
   ```
5. Add `0.0.0.0/0` to Network Access (allows Render to connect)

---

## Step 2: Deploy to Render

### Option A: One-Click Deploy (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `salmanxploer/stump-tree-email-magic`
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `bubt-cafe-api` |
| **Region** | Singapore (or nearest) |
| **Branch** | `master` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Add Environment Variables (click **Advanced** → **Add Environment Variable**):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `JWT_SECRET` | `your-super-secret-key-change-this` |
| `CLIENT_URLS` | `https://bubt-cafe.netlify.app` |
| `GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` |
| `GOOGLE_CALLBACK_URL` | `https://bubt-cafe-api.onrender.com/auth/google/callback` |
| `ADMIN_EMAILS` | `your-admin-email@gmail.com` |

6. Click **Create Web Service**

---

## Step 3: Configure Google OAuth

After your Render service is deployed, update Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**:
   ```
   https://bubt-cafe-api.onrender.com/auth/google/callback
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://bubt-cafe-api.onrender.com
   https://bubt-cafe.netlify.app
   ```
5. Save changes

---

## Step 4: Update Netlify Frontend

Once your backend is deployed on Render:

1. Go to [Netlify Dashboard](https://app.netlify.com) → Your site → **Site settings** → **Environment variables**
2. Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://bubt-cafe-api.onrender.com` |

3. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## Step 5: Seed Initial Data (Optional)

To add sample menu items, run the seed script:

1. In Render dashboard, go to your service → **Shell**
2. Run:
   ```bash
   npm run seed
   ```

Or locally (with .env configured):
```bash
cd server
npm run seed
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (use a strong random string) |
| `GOOGLE_CLIENT_ID` | ✅ | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ | From Google Cloud Console |
| `CLIENT_URLS` | ✅ | Your Netlify frontend URL |
| `GOOGLE_CALLBACK_URL` | ✅ | `https://your-render-url.onrender.com/auth/google/callback` |
| `ADMIN_EMAILS` | ❌ | Comma-separated emails that get admin role |
| `PORT` | ❌ | Default: 10000 (Render's default) |
| `NODE_ENV` | ❌ | Set to `production` |

---

## Troubleshooting

### "Service unavailable" after deploy
- Wait 1-2 minutes for first deploy
- Check Render logs for errors
- Verify MongoDB connection string is correct

### Google OAuth not working
- Ensure callback URL matches exactly
- Check that your domain is in authorized origins
- Verify client ID and secret are correct

### CORS errors
- Make sure `CLIENT_URLS` includes your Netlify domain
- Check that it doesn't have a trailing slash

### Database connection failed
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check username/password in connection string
- Ensure database name is included in URI

---

## Free Tier Limitations

Render Free Tier:
- ⚠️ Service sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month free
- Auto-deploys on every git push

For production use, consider upgrading to Starter ($7/month) for always-on service.

---

## Verify Deployment

After everything is set up:

1. Visit `https://bubt-cafe-api.onrender.com/health` - should return `{ "status": "ok" }`
2. Try logging in at `https://bubt-cafe.netlify.app`
3. Check that menu items load from the database
4. Test creating an order

Your full-stack BUBT Cafeteria app is now live! 🎉
