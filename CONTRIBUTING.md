# Contributing

Thanks for contributing.

## Local Setup

Use a local static server rather than opening `index.html` directly:

```bash
npx serve .
```

The app needs camera permission and a browser that supports webcam access on `localhost` or HTTPS.

## Project Structure

- `index.html` is the static entrypoint
- `src/` contains the browser runtime modules
- `tests/` contains unit tests for the pure game and tracking logic
- `weights/` contains the local model files used by `face-api.js`

## Testing

Run the test suite before opening a pull request:

```bash
npm test
```

If you change tracking rules or round behavior, add or update tests in `tests/`.

## Contribution Guidelines

- keep the app deployable as a static site
- prefer small, reviewable changes
- keep detector-specific logic behind the adapter boundary instead of mixing it into the game logic
- document any behavior changes that affect setup, runtime assumptions, or limitations

## Pull Requests

Open a pull request with:

- a short problem statement
- the behavior change or fix
- the tests or manual verification you ran

If your change affects browser behavior, include a brief note about how it behaves with zero, one, and two visible faces.
