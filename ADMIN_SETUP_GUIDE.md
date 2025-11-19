# How to Create Admin Account in Firebase Console

Since you mentioned you already set it in Firebase, follow these steps to ensure it's configured correctly:

## Option 1: Using Firebase Console (Manual)

### Step 1: Create the Authentication User
1. Go to https://console.firebase.google.com
2. Select your project: `bubt-2c983`
3. Click **Authentication** in the left menu
4. Click **Users** tab
5. Click **Add user**
6. Enter:
   - Email: `admin@bubt.edu`
   - Password: `admin1234`
7. Click **Add user**
8. **COPY THE UID** that appears (you'll need this for Step 2)

### Step 2: Create the Firestore Profile
1. Click **Firestore Database** in the left menu
2. Find or create a collection called `users`
3. Click **Add document**
4. Set Document ID to the **UID you copied** from Step 1
5. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `id` | string | [Paste the UID here] |
| `name` | string | `Administrator` |
| `email` | string | `admin@bubt.edu` |
| `role` | string | `admin` |
| `approved` | boolean | `true` |
| `createdAt` | string | `2025-01-18T00:00:00.000Z` |

6. Click **Save**

### Step 3: Test Login
1. Go to your application login page
2. Enter:
   - Email: `admin@bubt.edu`
   - Password: `admin1234`
3. Click **Sign in**
4. You should be redirected to `/admin/dashboard`

---

## Option 2: Using the Script (Automated)

Run this command from your project folder:

```bash
node create-admin.js
```

This automatically creates both the authentication user AND the Firestore profile.

---

## Common Issues & Solutions

### Issue: "User profile not found"
**Solution:** You created the auth user but forgot to create the Firestore profile. Complete Step 2 above.

### Issue: "Invalid email or password"
**Solution:** 
- Make sure email is exactly `admin@bubt.edu` (lowercase)
- Make sure password is exactly `admin1234`
- Check Firebase Console Authentication > Users to verify the user exists

### Issue: "Login successful but wrong dashboard"
**Solution:** The `role` field in Firestore is not set to `admin`. Go to Firestore Database > users > [admin UID] and verify the `role` field is `admin`.

### Issue: Still redirected to customer page
**Solution:** Clear your browser cache and localStorage:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

---

## Verifying Everything is Correct

### In Firebase Authentication:
- [ ] User exists with email `admin@bubt.edu`
- [ ] User has a UID (something like `AbCdEf123456`)

### In Firestore Database:
- [ ] Collection `users` exists
- [ ] Document with ID matching the UID exists
- [ ] Document has field `role` = `admin`
- [ ] Document has field `email` = `admin@bubt.edu`
- [ ] Document has field `approved` = `true`

### After Login:
- [ ] Success message appears
- [ ] URL changes to `/admin/dashboard`
- [ ] Admin dashboard content loads

---

## Example Firestore Document Structure

```json
{
  "id": "AbCdEf123456",
  "name": "Administrator",
  "email": "admin@bubt.edu",
  "role": "admin",
  "approved": true,
  "createdAt": "2025-01-18T00:00:00.000Z"
}
```

Make sure the **Document ID** matches the **UID** from Firebase Authentication!
