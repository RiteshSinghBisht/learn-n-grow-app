# Learn N Grow

AI-powered English communication coaching app with two guided chat experiences:

- `Fluent` for grammar-focused help
- `Khushi` for conversation practice and speaking confidence

## Core Features

- Email/password authentication
- Personalized dashboard with stats and daily learning content
- Dual chat flows (grammar + conversation)
- Voice recording and voice message playback
- n8n webhook integration for bot responses and feedback routing
- Profile management (name, photo, password, sign out)
- In-app account deletion flow
- Public privacy policy and account deletion pages for Play Console compliance

## Stack

- HTML, CSS, JavaScript (vanilla)
- Firebase Auth + Firestore
- Supabase (announcements source)
- Capacitor Android wrapper for Play Store packaging
- Firebase Hosting / Vercel for static deployment

## Main Files

```text
.
├── index.html
├── styles.css
├── app.js
├── privacy-policy.html
├── account-deletion.html
├── service-worker.js
├── manifest.webmanifest
├── firebase-config.js
├── supabase-config.js
├── scripts/build-web.mjs
├── firebase.json
└── android/
```

## Local Run

```bash
npm install
npm run build
npm run serve
```

Then open `http://localhost:5500`.

## Build + Android Packaging

```bash
npm run build
npm run cap:sync
npm run android:open
```

Release bundle output (after Android Studio signed build):

```text
android/app/release/app-release.aab
```

## Play Console URLs

- Privacy policy: `https://learn-n-grow-7ef71.web.app/privacy-policy.html`
- Account deletion page: `https://learn-n-grow-7ef71.web.app/account-deletion.html`
- In-app deletion path: `Profile > Delete Account`

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` serves from `dist/` and rewrites routes to `index.html`.

### Vercel

```bash
vercel deploy --prod
```

If prompted, choose the existing linked project and deploy from repo root.

## Configuration Notes

- Firebase client config is in `firebase-config.js`
- Webhook endpoints are in `app.js`
- Review `firestore.rules` before production use

## License

MIT (`LICENSE`)
