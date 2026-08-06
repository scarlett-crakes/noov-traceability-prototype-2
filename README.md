# Tracy

Supply chain traceability platform for used cooking oil (UCO), built by [Noovoleum](https://noovoleum.com). Tracy tracks the full chain of custody for trace units from point of origin through collection, storage, and audit — with role-based access for admins, collectors, and auditors.

**Live:** https://traceability.ucollect.dev

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Routing | TanStack Router |
| Backend | Convex (real-time database + HTTP actions) |
| Auth | better-auth (hashed passwords, session management) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Lineage graph | React Flow (@xyflow/react) |
| Deployment | Cloudflare Pages |

---

## Getting started

### Prerequisites

- Node.js v18+
- A [Convex](https://convex.dev) account and deployment

### Local development

```bash
git clone https://github.com/noovoleum/noov-traceability-prototype-2.git
cd noov-traceability-prototype-2
npm install
```

Set up your environment variables in `.env.local`:

```
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
VITE_CONVEX_SITE_URL=https://<your-deployment>.convex.site
```

Start the Convex dev server and the frontend:

```bash
npx convex dev        # in one terminal
npm run dev           # in another
```

Open **http://localhost:5173**.

---

## Deployment

Build and deploy to Cloudflare Pages:

```bash
npm run build
npx wrangler pages deploy dist --project-name <your-project-name>
```

---

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@tracy.com | admin123 |
| Collector | collector@tracy.com | collector123 |
| Auditor | auditor@tracy.com | auditor123 |

---

## Role permissions

| Feature | Admin | Collector | Auditor |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ read-only |
| Assets | ✅ | ✅ | ✅ |
| Origins (PoO) | ✅ | ✅ | ❌ |
| Trace Units | ✅ | ✅ | ✅ read-only |
| TU Split | ✅ | ✅ | ❌ |
| Lineage | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ❌ | ✅ |
| Actors | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## Commands

```bash
npm run dev       # start local dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview production build locally
npx convex dev    # run Convex backend locally
```
