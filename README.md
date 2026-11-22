# iAuth — FMDQ Single Sign On

React + Vite frontend for FMDQ's iAuth SSO admin portal: login, admin registration, and a dashboard of connected legacy applications.

## Stack

- [Vite](https://vite.dev/) + React 19
- [React Router](https://reactrouter.com/) for routing/guards
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [React Hook Form](https://react-hook-form.com/) for form state/validation
- [Axios](https://axios-http.com/) for API calls
- [react-hot-toast](https://react-hot-toast.com/) for notifications

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. API requests to `/api/*` are proxied (see `vite.config.js`) to the remote `authService` backend to avoid browser CORS issues — see `.env.example` for the required environment variables.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base path. Defaults to `/api` (dev proxy). Point at the full host for a production build without a reverse proxy. |
| `VITE_BASIC_AUTH_USERNAME` / `VITE_BASIC_AUTH_PASSWORD` | Service-level Basic Auth credentials required by the admin register endpoint. |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Screens

- `/login` — admin login
- `/register` — admin self-registration
- `/dashboard` — protected grid of connected FMDQ legacy applications
