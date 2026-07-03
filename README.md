# Tracy — Traceability MVP Frontend

Frontend for the Tracy UCO traceability platform. Built with React + Vite + TanStack Router + Tailwind CSS + shadcn/ui. All data is dummy/static — no backend connection required.

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

## Running locally

```bash
# 1. Clone the repo
git clone https://github.com/noovoleum/noov-traceability-prototype-2.git
cd noov-traceability-prototype-2

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Demo accounts

Use these to log in — no setup needed:

| Role      | Email                   | Password       |
|-----------|-------------------------|----------------|
| Admin     | admin@tracy.com         | admin123       |
| Collector | collector@tracy.com     | collector123   |
| Auditor   | auditor@tracy.com       | auditor123     |

## Role permissions

| Feature              | Admin | Collector | Auditor |
|----------------------|:-----:|:---------:|:-------:|
| Dashboard            | ✅    | ✅        | ✅      |
| Inventory            | ✅    | ✅        | ✅ (read-only) |
| Assets & Storage     | ✅    | ✅        | ✅      |
| Origins (PoO)        | ✅    | ✅        | ❌      |
| Actors               | ✅    | ❌        | ❌      |
| Trace Units          | ✅    | ✅        | ✅ (read-only) |
| Audit Log            | ✅    | ❌        | ✅      |
| Settings             | ✅    | ❌        | ❌      |
| Create Trace Unit    | ✅    | ✅        | ❌      |

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) icons
- [React Flow (@xyflow/react)](https://reactflow.dev/) for TU lineage graph
- [better-auth](https://www.better-auth.com/) client (mock auth — no backend)

## Other commands

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```
