# Replica Landscapes — Modern Room Studio

A standalone, fully modelled 3D room planner, ready for a GitHub repository and static hosting. This package contains the latest Room Studio only, not the full shop website. It uses plain JavaScript and Three.js; it is not a Next.js or Shopify application.

## Run locally

Install Node.js (20 or newer), open a terminal in this folder, then run:

```sh
npm run dev
```

Open http://localhost:3000. Do not open index.html directly: 3D assets and JavaScript modules need an HTTP server. All runtime dependencies are bundled under dist/vendor, so npm install is not required.

```sh
npm run build
npm test
```

The build command checks the existing static output and state tests; it does not compile the Blender files.

## Add to GitHub

1. Extract the ZIP.
2. Create an empty repository on GitHub.
3. Upload the contents of this folder, including dist/, tools/, scripts/, package.json, vercel.json and .gitignore. Upload the extracted files, not the ZIP itself. GitHub Desktop is convenient for the many model and texture files.
4. Commit and push. The root of the repository should contain package.json and README.md directly.

No credentials, Git history, ChatGPT hosting configuration or node_modules are included. The full brand logo is in dist/logo.png.

## Deploy on Vercel

Import your GitHub repository. Keep the repository root as Root Directory. Use Framework Preset **Other**, Build Command **npm run build**, and Output Directory **dist**. The included vercel.json supplies these settings. No environment variables or Shopify credentials are needed for this demo.

## Features

- Modern living room with ivory upholstery and oak details.
- Four reference plant types; arrange up to 12 instances.
- Mouse/finger dragging over the floor; background orbit and scroll/pinch zoom.
- Height, rotation, planter size, four planter shapes and four finishes.
- Duplicate, remove, precise position arrows and inspect view.
- Save arrangements on the same device using localStorage.

## Important limits

Live editing requires WebGL2. Unsupported browsers show a clearly labelled offline Blender render with editing disabled. The screenshot/render is not the live renderer. Physical touchscreen operation and GPU appearance were not verified in the development browser, which has WebGL disabled. State/model checks and a headless editor test covered control logic and mouse/touch pointer handlers using real raycasting with the GPU renderer stubbed.

Plants are textured reference models, not exact scans of catalogue products. Heights are demo estimates. Furniture collision detection, actual room scanning, AR, payments and Shopify catalogue/cart integration are not implemented. Moving plants can overlap furniture. Save is device-local, not a user account or backend.

The logo links to the existing shop demo; change that anchor in dist/index.html for your own website. For a larger Next.js store, mount this studio as a separate static route or adapt its modules into a client component; it is not automatically integrated with the store.

## Editing and assets

- dist/index.html — UI and content
- dist/real-studio.css — responsive styling
- dist/real-studio.js — renderer and editor interactions
- dist/room-state.js — plant definitions, sizing and saved state
- dist/real-assets/ — room, foliage, material sources and previews
- tools/modern-room-studio.blend — editable 3D scene
- tools/build_modern_room.py — rebuild/export room and foliage with Blender 4.3
- tools/render_plant_thumbs.py — render plant thumbnails
- tools/REAL-3D.md — implementation notes and asset attribution

The Blender script uses the original source models and maps included under dist/real-assets. Rebuilding is optional; the exported assets are ready to serve. The .blend master is not downloaded by the website.

## Third-party licensing

Three.js is MIT-licensed; retain dist/vendor/LICENSE. Plant models, HDRI and texture maps are from Poly Haven under CC0; see THIRD-PARTY-ASSETS.md for attribution. Client branding is not licensed for unrelated resale. Confirm rights before using client logos commercially outside this project.
