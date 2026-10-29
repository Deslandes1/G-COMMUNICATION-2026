# G Communication Portal

Private chat, voicemail, and peer-to-peer voice calls — a mobile-first telecom app built by **Gesner Deslandes**.

## Live app

`https://YOUR-USERNAME.github.io/g-comm/`

## Features

- **Chat** — real-time text messages synced through Firebase Realtime Database
- **Voicemail** — record audio on your phone and send it to any contact
- **Voice calls** — real two-way audio using WebRTC (PeerJS + STUN)
- **Works offline for receivers** — chat and voicemail are stored in Firebase
- **PWA** — installable on iPhone and Android home screens

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (single `index.html`) |
| Messaging + voicemail storage | Firebase Realtime Database |
| Voice calls | WebRTC via PeerJS |
| Hosting | GitHub Pages |
| Offline cache | Service Worker |

## How to use

1. Open the app, enter your name — you get a **Peer ID** on the Profile tab.
2. Share that ID with the person you want to reach.
3. They tap **＋**, paste your ID, and give you a name.
4. You do the same with their ID.
5. Chat, call, or record a voicemail.

## Deploy it yourself
