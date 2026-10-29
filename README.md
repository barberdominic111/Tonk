# Tonk (PWA)

Pass-and-play Tonk for 2–4 players (people and/or computer), with Classic, Bright and Neon themes.
Stack: React 18 + Vite 5 + vite-plugin-pwa (plus `htm`, a tiny template helper used instead of JSX in App.jsx).

## Run locally
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build in dist/
    npm run preview    # serve the build locally

## Deploy (GitHub + Vercel)
1. Create an empty repo on github.com, then in this folder:
   git init && git add . && git commit -m "Tonk" && git branch -M main
   git remote add origin <your-repo-url> && git push -u origin main
2. vercel.com > Add New > Project > import the repo > Deploy (Vite is auto-detected:
   build command `npm run build`, output directory `dist`).
3. Open the Vercel URL on your phone. iPhone: Share > Add to Home Screen. Android: browser menu > Install app.
4. Offline: open the app once online; afterwards it works with no connection. Games auto-save on the device.
5. Updates: git add . && git commit -m "change" && git push. Vercel redeploys and the app updates itself on next launch.
