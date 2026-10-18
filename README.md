# CalmConnect

A mental health and wellness platform built around one problem: people don't ask for help because of stigma and fear of being judged. Users share under pen names, get support from verified therapists and volunteer listeners, and track their own wellbeing.

**Stack:** React (Vite) + React Router + Bootstrap 5 · Node + Express · PostgreSQL (Neon)

## Setup

You need **Node.js 20+** and a free **Neon** database ([neon.tech](https://neon.tech)).

1. Create a Neon project, open **Connect**, turn **Connection pooling** off, click **Show password** and copy the connection string.
2. Set up the backend:

   ```bash
   cd server
   npm install
   cp .env.example .env      # paste the string as DATABASE_URL, set JWT_SECRET
   npm run db:setup          # creates all tables, sample data and the admin account
   npm run dev               # http://localhost:5001
   ```

3. Set up the frontend in a second terminal:

   ```bash
   cd client
   npm install
   npm run dev               # http://localhost:5173
   ```

Admin login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (default `admin@calmconnect.local` / `admin123`).

`npm run db:setup` deletes all data and starts fresh. Run it again whenever `schema.sql` changes.

### Demo data

```bash
cd server
npm run db:setup && npm run db:demo
```

| Account | Password | Role |
|---|---|---|
| `asha@demo.com` | `demo1234` | User with 30 days of mood, journal, check-ins, posts |
| `kabir@demo.com`, `meera@demo.com`, `rohan@demo.com` | `demo1234` | Users |
| `ananya@demo.com`, `kunal@demo.com`, `farah@demo.com` | `demo1234` | Verified helpers |
| `vikram@demo.com` | `demo1234` | Helper application waiting for approval |
| `admin@calmconnect.local` | `admin123` | Admin |

### AI assistant

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and put it in `server/.env` as `GEMINI_API_KEY`. Without a key the rest of the app works and the assistant page explains that it isn't set up.

## Project layout

```
client/src/
  api/axios.js            every API call goes through this
  crypto.js               all chat encryption (Web Crypto API)
  context/AuthContext.jsx logged-in user
  components/             Navbar, Footer, Layout, ProtectedRoute, shared pieces
  pages/                  one file per page, admin pages in pages/admin/
  styles/theme.css        our colours and fonts, Bootstrap re-coloured to match
  styles/app.css          our own styles (all classes start with cc-)
server/
  sql/schema.sql          all tables
  sql/seed.sql            sample data
  sql/setup.js            runs schema + seed, creates the admin
  src/options.js          fixed lists: circles, specialisations, languages, ...
  src/index.js            app setup and routes
  src/middleware/auth.js  requireAuth, requireAdmin
  src/routes/             one file per feature
```

## Where to change things

| To change | Edit |
|---|---|
| Circles, reactions, crisis words, check-in questions, specialisations, languages, emotions | `server/src/options.js` |
| Words used for pen names | `penNameWords` in `server/src/options.js` |
| A table or column | `server/sql/schema.sql`, then `npm run db:setup` |
| Starter resources and affirmations | `server/sql/seed.sql` |
| Demo accounts and activity | `server/sql/demo.js` |
| What the AI assistant is told | `aiInstructions` in `server/src/options.js` |
| Colours and fonts | top of `client/src/styles/theme.css` |
| Menu links | `client/src/components/Navbar.jsx` |
| Pages and URLs | `client/src/App.jsx` |

## How the encrypted chat works

1. On sign-up the browser makes an ECDH key pair. The public key goes to the server. The private key stays in the browser, and a copy locked with the user's password is stored on the server so the user can log in on another device.
2. Both people in a chat combine their own private key with the other person's public key and get the same AES key. That key is never sent anywhere.
3. Messages are encrypted in the browser before sending. The `messages` table only holds `ciphertext` and `iv`.
4. New messages are fetched every 3 seconds.

## Design and viva explanation

The interface follows the Cogni:wave reference's large type, lilac accents, pastel backgrounds, rounded dark sections and two-card layout. It keeps CalmConnect's routes and features. The artwork uses local generated 3D renders and editorial photographs, with CSS motion. These approximate the reference rather than using its original source assets. No additional frontend dependency was added.

- **React** builds reusable components and manages form state.
- **Vite** runs the development server and produces the frontend build.
- **React Router** switches pages and protects signed-in routes.
- **Bootstrap 5** provides the responsive grid, forms and buttons; ordinary CSS customizes their appearance.
- **Express on Node.js** handles authentication and the feature API routes.
- **PostgreSQL on Neon** stores application data. The `pg` package runs parameterized SQL directly; there is no ORM.
- **Gemini** is called by Express using Node's built-in `fetch`. The browser never receives the API key.
- Existing JWT authentication, password hashing, charts and browser-based chat encryption remain in place.

A request travels from a React page, through `client/src/api/axios.js`, to an Express route. The route checks authentication and reads/writes PostgreSQL. Express returns JSON and React updates the screen. AI requests follow the same path but call Gemini instead of storing the conversation.

### Configure your environment

Place your supplied environment file at `server/.env`. Required values are `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY` and optionally `GEMINI_MODEL`; use `server/.env.example` for the full list. Start backend commands from the `server` directory so dotenv loads that file. Do not prefix secrets with `VITE_`: those values are exposed to browsers.

The AI endpoint validates messages, limits the context to the latest ten messages, uses a 30-second timeout, handles quota errors and keeps the existing crisis-response path. Live database and Gemini verification require your actual environment values. Never run `db:setup` against a database with data you want to retain: that script resets tables.

The base visual overrides are in `client/src/styles/redesign.css`; the final shared design and motion rules are in `client/src/styles/editorial.css`. `PageIntro.jsx` supplies shared headers, and `WellnessArt.jsx` displays the local hero render. See `DESIGN.md` for asset paths and generation prompts.


### Verified local configuration

The supplied environment is saved only in ignored `server/.env`. Neon connectivity, admin sign-in, resources, options, authenticated profile/admin reads and a real Gemini reply through `/api/ai/chat` were verified. Invalid and empty AI payloads return HTTP 400. The production frontend build passes.

This machine already had another server using port 5000, so CalmConnect's API uses **5001**. Vite proxies `/api` there. Open **http://localhost:5173/**. Start the backend with `npm start` from `server` and the frontend with `npm run dev` from `client`. Existing database tables and data were retained.

