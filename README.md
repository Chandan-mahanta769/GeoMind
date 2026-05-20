# GeoMind — Location Reminders Prototype

This workspace contains a minimal prototype for GeoMind: a location-based reminders app using React (Vite) on the client and Node (Express) on the server.

Quick start

1. Install dependencies for client and server:

```bash
cd GeoMind/client
npm install

cd ../server
npm install
```

2. Start the server and client (two terminals):

```bash
cd GeoMind/server
npm run dev

cd GeoMind/client
npm run dev
```

3. Open the client URL shown by Vite (usually http://localhost:5173), allow location and notification permissions.

Notes
- Reminders are stored in browser localStorage and mirrored to the server (in-memory).
- This is a prototype: persistence, authentication, and push notifications can be added later.
