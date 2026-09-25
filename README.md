# Proofline: Live Claim Verifier UI

A responsive React interface for checking one claim against current web evidence. The UI does not produce verdicts itself; it sends a request to the fact-checking API and displays its result, confidence, evidence, and sources.

## Run locally

Install Node.js 20 or later, then from this directory run:

```powershell
npm install
npm run dev
```

To build for production, run `npm run build`.

## Connect the verifier

By default, the UI sends requests to `/api/check-claim`. Set `VITE_FACTCHECK_API_URL` to the API endpoint before starting Vite to use a different URL, for example:

```powershell
$env:VITE_FACTCHECK_API_URL = "http://localhost:8000/api/check-claim"
npm run dev
```

The endpoint should accept `POST` JSON in this shape:

```json
{
  "claim": "India won the 2024 T20 World Cup",
  "language": "english",
  "with_justification": false
}
```

Return JSON with a `verdict` of `true`, `false`, or `needs_review`. The interface also displays `confidence`, `support_threshold`, `review_threshold`, `evidence`, `sources` (`title` and `url`), `reason`, and `justification` when provided. When serving the API on another origin, configure it to allow requests from the UI's origin.

This workspace contains only the frontend. Run the Python verifier and its Ollama and Serper dependencies separately, and expose an HTTP endpoint with the request and response contract above.