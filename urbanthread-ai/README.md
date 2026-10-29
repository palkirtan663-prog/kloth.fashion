# UrbanThread AI with Login (Kloth.Fashion)

Streetwear e-commerce site for a TYBSc Computer Science project.

- **Client:** React 19 + Vite
- **Server:** Node.js + Express 5
- **Database:** MongoDB via Mongoose (MongoDB Atlas **or** local MongoDB)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`), roles `user` / `admin`
- **Chatbot:** works in demo mode with no key; optional OpenAI-compatible AI endpoint

---

## 1. Quick start on Windows

Requirements: **Node.js 20.19+** (or 22.12+) and either a free MongoDB Atlas cluster or MongoDB Community Server.

Open **PowerShell** in the project folder (the one containing this README):

```powershell
node -v                                   # must be v20.19 or newer
npm run setup                             # installs root + server + client dependencies

copy server\.env.example server\.env      # then edit server\.env  (see section 3)
copy client\.env.example client\.env      # normally needs no edits

npm run images                            # downloads the product photos (see section 6)
npm run dev                               # starts API (port 5000) + website (port 5173)
```

Open <http://localhost:5173>. The login page comes first; the store opens after you log in.

Using **Command Prompt** instead? The commands are identical (`copy` and `npm` work the same way).

Generate the `JWT_SECRET` value for `server\.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

On first start with an empty database the server inserts the demo products automatically
(`AUTO_SEED_PRODUCTS=true`). To seed manually: `npm run seed`.

### All commands (run from the project root)

| Command | What it does |
|---|---|
| `npm run setup` | Install dependencies for root, `server/` and `client/` |
| `npm run dev` | Run API and website together |
| `npm run server` / `npm run client` | Run only one of them |
| `npm run seed` | Add/update the 10 demo products (safe to re-run, matched by name) |
| `npm run seed:reset` | Delete **all** products, then insert the demo catalogue |
| `npm run seed:admin` | Create/promote the admin from `ADMIN_EMAIL` + `ADMIN_PASSWORD` |
| `npm run migrate:users` | One-time import of old `server/data/users.json` accounts into MongoDB |
| `npm run images` | Download product photos listed in `client/images.manifest.json` |
| `npm run build` | Production build of the client (`client/dist`) |
| `npm start` | Run the API without file watching (production style) |
| `npm test` | Server unit tests (no database needed) |

---

## 2. MongoDB setup

The server **will not start listening** until MongoDB is connected. If the connection string is wrong or
the database is unreachable, it prints one clear message and exits (for example *"Authentication failed…"*,
*"Could not reach the database… add your IP under Network Access"*, *"Connection refused…"*).

### Option A: MongoDB Atlas (cloud, free tier)

1. Create an account at <https://www.mongodb.com/cloud/atlas> and create a free **M0** cluster.
2. **Database Access** → *Add New Database User* → choose a username and password → role *Read and write to any database*.
3. **Network Access** → *Add IP Address* → *Add Current IP Address* (or `0.0.0.0/0` for a quick demo only).
4. **Database** → *Connect* → *Drivers* → copy the `mongodb+srv://…` string.
5. Put it in `server\.env`, replacing the placeholders and adding the database name `urbanthread` before the `?`:

   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/urbanthread?retryWrites=true&w=majority
   ```

   If the password contains `@ : / ? # %`, URL-encode it (`@` → `%40`).

### Option B: local MongoDB

1. Install **MongoDB Community Server** (the Windows installer can run it as a service).
2. Check that the service is running (Windows → *Services* → *MongoDB Server*).
3. Use:

   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/urbanthread
   ```

The connection string is logged only in redacted form (credentials and query string removed).

---

## 3. Environment variables

`server/.env` (copy from `server/.env.example`; git-ignored)

| Variable | Required | Meaning |
|---|---|---|
| `MONGODB_URI` | **yes** | Atlas or local connection string |
| `JWT_SECRET` | **yes** | Random string, 32+ characters, signs login tokens. The server refuses to start with a placeholder |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `2h` |
| `PORT` | no | API port, default `5000` |
| `CLIENT_ORIGIN` | no | Allowed browser origin(s), comma-separated. Default `http://localhost:5173,http://127.0.0.1:5173` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | First-admin bootstrap (section 4) |
| `AUTO_SEED_PRODUCTS` | no | `true` (default) inserts demo products when the collection is empty |
| `AI_API_KEY` | no | Leave empty for **demo mode** |
| `AI_BASE_URL` | no | Any OpenAI-compatible base URL, default `https://api.openai.com/v1` |
| `AI_MODEL` | no | Default `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | no | AI request timeout, default `15000` |

`client/.env` (copy from `client/.env.example`; git-ignored)

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | API base URL including `/api`, default `http://localhost:5000/api` |

Only `VITE_*` variables reach the browser. **The AI key is only ever read by the server.**

---

## 4. Creating the first admin

There are **no default credentials**. Everyone who signs up is a `user`; the `role` field is ignored
on registration. To get an admin:

1. In `server\.env` set a real email and a strong password (8–72 characters, a letter and a number):

   ```
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=choose-a-strong-one-123
   ```
2. Start the server (`npm run dev`) or run `npm run seed:admin`.
   - Email not registered → the admin account is **created**.
   - Email already registered → that account is **promoted** (its password is not touched).
3. Log in, then remove `ADMIN_PASSWORD` from `.env` if you wish.

Admins get a **Users** button in the navbar: view accounts, promote/demote, delete.
Safety rules enforced by the API: you cannot change or delete your own account, and the last admin can
never be demoted or deleted.

### Coming from the old JSON version?

If you have an old `server/data/users.json`, run `npm run migrate:users` once. Password hashes are kept, so
those users can log in with their old passwords. (The old built-in default admin no longer exists.)

---

## 5. Project structure

```
urbanthread-ai/
├─ package.json            root scripts (setup, dev, seed, build, test…)
├─ README.md
├─ .gitignore              ignores node_modules, .env files, dist, server/data
├─ server/
│  ├─ package.json
│  ├─ .env.example
│  ├─ test/                unit tests (node:test, no database needed)
│  └─ src/
│     ├─ server.js         entry: validate env → connect MongoDB → seed → listen
│     ├─ app.js            Express app (CORS, JSON, routes, error handling)
│     ├─ config/           env.js (validated config), db.js (Mongoose connection)
│     ├─ models/           User.js, Product.js
│     ├─ controllers/      auth, product, admin, chat
│     ├─ routes/           authRoutes, productRoutes, adminRoutes, chatRoutes
│     ├─ middleware/       authenticate, authorize, errorHandler, validateObjectId, loginLimiter
│     ├─ services/         aiChatService.js (demo + AI chatbot logic)
│     ├─ utils/            jwt, validators, dbErrors
│     └─ seed/             seedProducts, seedAdmin, importLegacyUsers
└─ client/
   ├─ package.json, vite.config.js, index.html, .env.example
   ├─ images.manifest.json  which photo each file in public/images comes from
   ├─ scripts/download-images.mjs
   ├─ public/images/        product + hero photos (downloaded by `npm run images`)
   └─ src/
      ├─ main.jsx, App.jsx
      ├─ pages/            AuthPage, StorePage
      ├─ components/       Header, Hero, ProductCard, CartDialog, ChatWidget, AdminPanel, Img, Tilt
      ├─ hooks/            useAuth (session restore), useProducts (loading/error states)
      ├─ services/api.js   fetch wrapper, token storage, VITE_API_BASE_URL
      ├─ utils/format.js
      └─ styles/styles.css
```

---

## 6. Product photos (please read)

Products point to local files such as `/images/midnight-box-tee.jpg`. `client/images.manifest.json` lists the
Unsplash photo behind each file, and `npm run images` downloads them into `client/public/images/`. The script checks
every download (HTTP status, image content-type, minimum size) and prints a line per file.

**Current state, honestly:**

- Five photos are configured (hero, two tees, two hoodies). I chose them from Unsplash's own page titles and tags
  ("man wearing black crew-neck t-shirt", "man in gray hoodie standing", …). I could not download or view
  them while preparing this project, so **open each file after `npm run images` and confirm it looks right**
  for its product. Unsplash titles don't say "oversized" or "studio shot".
- **Six products have no photo configured yet**: Studio Cargo, Ranger Cargo, Everyday Wide Pant,
  Afterhours Overshirt, Field Overshirt, Mono Track Jacket. I did not find verified photos for cargo trousers,
  wide-leg pants, overshirts or jackets, and I did not want to guess at image IDs. Until you add them, the
  store shows a labelled dark tile with the product name for those items.
- To add one: open a photo on <https://unsplash.com>, copy the 11-character ID at the end of the URL
  (`unsplash.com/photos/some-title-`**`AbCdEfGhIjK`**), paste it as `unsplashId` in `client/images.manifest.json`,
  then run `npm run images`. You can also simply drop your own `.jpg` into `client/public/images/` using the
  file names the manifest/seed expect.
- Unsplash photos are free under the [Unsplash License](https://unsplash.com/license); crediting the
  photographer is appreciated.

Any image that fails to load shows the fallback tile instead of a broken icon. Product cards use a fixed
4:5 ratio with `object-fit: cover`, lazy loading and descriptive `alt` text; the hero loads eagerly.

---

## 7. How it works

**Authentication.** Sign up → password hashed with bcrypt → stored in MongoDB (`passwordHash` is `select:false`
and stripped from every JSON response). Login returns a signed JWT; the browser sends it as
`Authorization: Bearer <token>`. On page refresh the site calls `GET /api/auth/me` to restore the session; an
expired or invalid token logs the user out with a message. Logging out deletes the token in the browser (JWTs
are stateless, so there is no server-side session to destroy).

**Authorization.** `authenticate` loads the user from MongoDB on every request (so role changes and deletions
apply immediately). `authorize('admin')` guards `/api/admin/*`.

**Security measures.** bcrypt hashing · JWT secret required at startup · identical error for wrong email / wrong
password · 5 failed logins per 15 min per IP+email · input validation on client and server · field whitelisting
(no role/`_id` injection) · query values forced to strings and regexes escaped · invalid ObjectIds rejected with 400
· CORS limited to `CLIENT_ORIGIN` · errors never leak stack traces or connection strings.

**Chatbot.** Without `AI_API_KEY` the API answers with rule-based replies built from the products in MongoDB and
reports `mode: "demo"`; the chat window shows "Demo mode: scripted replies, no AI connected". With a key, the
server asks the model for JSON `{reply, productIds}` and rejects any answer that names a product not in the
database; timeouts, HTTP errors and bad output fall back to a demo reply labelled "AI unavailable". The model's
free-text wording can't be fully policed, so treat AI mode as assistive, not authoritative.

### API

| Method | Route | Access |
|---|---|---|
| GET | `/api/health` | public (503 when DB is down) |
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/products?q=&category=` , `/api/products/:id` | logged in |
| POST | `/api/chat` | logged in |
| GET | `/api/admin/users` | admin |
| PATCH | `/api/admin/users/:id/role` | admin |
| DELETE | `/api/admin/users/:id` | admin |
| POST / PATCH / DELETE | `/api/admin/products`, `/api/admin/products/:id` | admin (API only; no UI) |

---

## 8. Troubleshooting

| Message | Fix |
|---|---|
| `JWT_SECRET is a placeholder…` | Generate a real secret (section 1) and put it in `server\.env` |
| `Authentication failed` | Wrong Atlas username/password, or special characters not URL-encoded |
| `Could not reach the database… Network Access` | Add your IP in Atlas → Network Access |
| `Connection refused` | Local MongoDB service isn't running |
| `Port 5000 is already in use` | Stop the other program or change `PORT` (and `VITE_API_BASE_URL`) |
| Browser: "Cannot reach the server" | API not running, or `VITE_API_BASE_URL` wrong |
| Browser: CORS error | The site must run on an origin listed in `CLIENT_ORIGIN` (default port 5173) |
| Empty catalogue message | Run `npm run seed` |
| Vite refuses to start | Node must be 20.19+ / 22.12+ |

---

## 9. Verification status

Prepared in a sandbox **without internet access**, which determines what could and could not be verified.

| Check | Result |
|---|---|
| Server unit tests (`npm test`): validation, error mapping, env checks, URI redaction, chatbot demo + AI mode with mocked responses, incl. timeout/HTTP/bad-JSON fallbacks | **Passed (22 tests)** |
| Syntax check of every server and client file; all import/require paths and named exports resolve | **Passed** |
| Auth/admin control flow (register, role-forgery ignored, login, lockout, expired/forged/deleted-user tokens, promote/demote, self- and last-admin protection) against in-memory fakes of Mongoose/bcrypt/JWT | **Passed** (throwaway test, not included; it checks logic only, not real packages) |
| `npm install`, `vite build`, server startup | **Not run**: no registry access. Run `npm run setup` then `npm run build` |
| Live MongoDB / Atlas connection, Mongoose queries, real bcrypt/JWT, seeding, indexes, admin bootstrap | **Not verified**: no database was available |
| Browser testing (login/logout/refresh restore, cart, filters, responsive layout, chat widget) | **Not verified** |
| Photo downloads and whether each photo matches its product | **Not verified**; see section 6 |
| AI mode against a real provider | **Not verified** (unit-tested with mocked responses only) |

Known limitations: login rate limiting is in memory (resets on restart, per server instance); cart and wishlist are
in memory only (cleared on refresh, as before); checkout is a disabled demo button; there is no admin UI for
products (API only).
