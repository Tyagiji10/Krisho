# Firebase Firestore Setup Guide

Now that the backend has been migrated to 100% Firebase, you need to provide your Firebase Admin credentials in your `.env` file to enable the cloud database.

### 1. Generate a Service Account Key
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your **Krisho** project.
3. Click the **Gear Icon (Project Settings)** in the top left.
4. Go to the **Service Accounts** tab.
5. Click **Generate New Private Key** and download the `.json` file.

### 2. Update your `.env` file
Open `backend/.env` and add the following values from your downloaded `.json` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere...\n-----END PRIVATE KEY-----\n"
```

> [!IMPORTANT]
> Make sure the `FIREBASE_PRIVATE_KEY` is wrapped in double quotes and includes the `\n` characters exactly as shown in the file.

### 3. Restart the Server
Once you've added these variables, restart your backend server:
```bash
cd backend
npm run dev
```

You should see `✅ Firestore Database Ready` in the console!
