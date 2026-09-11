Drop your own logos here as:

- `instagram-logo.png`
- `linkedin-logo.png`

The badges on the closing screen already point at these paths (see the
`imageSrc` props in app/HomeClient.js) and will start using them
automatically the moment the files exist — no code changes needed.

Until then, each badge shows a plain "+" placeholder so there's a clear,
correctly-sized space reserved rather than a broken image icon.

Any reasonable image works — square-ish logos will fill the badge most
cleanly, since it's sized to contain (not crop) whatever you provide.
