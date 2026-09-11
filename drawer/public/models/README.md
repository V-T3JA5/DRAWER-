Drop your real model here as `main-model.glb`.

Companion3D.js already tries to load `/models/main-model.glb` first, before
falling back to the procedural placeholder shape — so once you add the real
file, it'll just start being used automatically. No code changes needed.

If your model has shape-key / morph target animations, export them as
relative deltas (the default for glTF/Blender shape-key exports) — the
loader already expects `morphTargetsRelative = true`.
