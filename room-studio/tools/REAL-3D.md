# Replica Landscapes — Modern Room Studio

The root page is a true Three.js 3D editor: modelled architecture and contemporary furniture, photographic PBR material maps, four detailed foliage assets, and separate interchangeable planter meshes. No photo overlay is used in live mode.

## Interaction
- Add any of four plant types; up to 12 instances.
- Click/tap foliage or its planter to select. Drag with mouse or finger over the floor plane; pointer capture prevents losing the drag outside the plant. Background gestures orbit; scroll/pinch zooms.
- Change overall height (40–260 cm), rotation, planter scale (70–140%), four planter shapes and four finishes.
- Precise position buttons, duplicate/remove, inspect selected plant, camera controls, reset.
- Save arrangement explicitly to browser localStorage. State is validated and bounded when loading.
- Materials/geometry belonging to discarded planters are disposed, while shared foliage geometry remains reusable.

Sizes are demo estimates, not a guarantee of room fit. Floor positioning is bounded but does not perform furniture collision detection. Models are references, not exact catalogue SKUs. Calathea and Pachira source files contain several variants; the studio exports one coherent plant variant from each, with base at zero and foliage height normalised to one metre. The broadleaf trunk is retained independently of the source container.

## Compatibility and checks
Requires WebGL2. A browser without it receives an honestly labelled offline Blender render of the same room, with editor controls disabled. Cloud-browser WebGL is unavailable, so live GPU interaction and physical touchscreen operation remain unverified. Node state checks cover import sanitisation, size constraints, placement limits and save/load. Model checks parse each GLB using Three.js and verify normalised foliage dimensions. A DOM-based integration check with a stubbed GPU renderer also exercised actual editor handlers: add/select, mouse/touch pointer drags using real raycasting, sizing, all planter styles/finishes, duplication, positioning, inspect, save, remove-all recovery and instance limit. Khronos validation checks asset structure.

## Sources (CC0)
- Potted Plant 01 & 02 — Rico Cilliers — https://polyhaven.com/a/potted_plant_01 and https://polyhaven.com/a/potted_plant_02
- Calathea Orbifolia 01 — Rico Cilliers, Rob Tuytel — https://polyhaven.com/a/calathea_orbifolia_01
- Pachira Aquatica 01 — Rico Cilliers, Rob Tuytel — https://polyhaven.com/a/pachira_aquatica_01
- Studio Small 09 — Sergej Majboroda — https://polyhaven.com/a/studio_small_09
- Wood Floor — https://polyhaven.com/a/wood_floor
- Cotton Jersey — https://polyhaven.com/a/cotton_jersey

Architecture, sofa, tables, decor and planter shapes are authored for this studio. Build and editable master: tools/build_modern_room.py and tools/modern-room-studio.blend. Transparent plant previews: tools/render_plant_thumbs.py. Runtime dependencies are self-hosted. Older photo visualiser preserved at /photo-visualiser.html.
