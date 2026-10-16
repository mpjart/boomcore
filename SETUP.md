# Setting up shared tables (Firebase)

Boom Dice uses Firebase so a whole party can share rolls, character sheets, loot, and the stash. Firebase's free plan is plenty for a gaming group. This is a one-time setup, about 10 minutes.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Tap **Create a project**, name it `boomcore`, and finish the steps (Google Analytics can be turned off).

## 2. Turn on anonymous sign-in

Players never make accounts. Each device signs in anonymously in the background.

1. In the left menu: **Build → Authentication → Get started**.
2. Under **Sign-in method**, pick **Anonymous**, turn it on, and **Save**.

## 3. Create the database

1. **Build → Firestore Database → Create database**.
2. Pick a location near you and start in **production mode**.
3. Open the **Rules** tab, replace everything with the contents of `firestore.rules` from this repo, and **Publish**.

## 4. Connect the app

1. Go to **Project settings** (the gear icon) → **General** → **Your apps** → tap the **</>** (Web) icon.
2. Name it `Boom Dice` and register it (skip Firebase Hosting).
3. Firebase shows a `firebaseConfig` block. Copy the `apiKey`, `authDomain`, `projectId`, and `appId` values into `firebase-config.js` in this repo.

These values are safe to publish. They only identify the project; the rules in `firestore.rules` control what anyone can do.

## How tables work

- The **Core Master** opens the app, enters a name, and taps **Start a new table**. The app shows a 6-letter table code at the top.
- **Players** enter their name and that code and tap **Join**.
- Each device remembers its table, so reopening the app goes straight back in. **Leave table** at the top switches tables.
- Only the person who started a table gets the CM tab and the Core Master controls.
- **Play solo** works without Firebase: you are the Core Master of a private table saved on that one device (the full CM tab, themes included), with no code to share.
