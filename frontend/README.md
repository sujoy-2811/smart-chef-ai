# Frontend - SmartChef AI

This is the React + Vite frontend for SmartChef AI.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React icons
- React Hot Toast

## Setup

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Open: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Frontend Features

- Dashboard overview
- Pantry UI
- Recipe generator UI
- My recipes list and detail pages
- Meal planner and shopping list UI
- Login and signup screens
- Settings page

Most flows are currently UI-first and use local/dummy behavior where backend APIs are not integrated yet.

## Routing

Main app routing is defined in `src/App.jsx`.

Protected pages are wrapped by `src/components/ProtectedRoute.jsx`.

## Important Paths

- `src/pages/` - page screens
- `src/components/` - reusable UI components
- `src/context/` - auth context
- `src/data/` - dummy/mock data
- `src/services/api.js` - API service layer entry

## Run With Backend From Root

If you want to run frontend and backend together:

```bash
cd smartchef-ai
npm run dev
```

This uses named processes (`API` and `APP`) via `concurrently`.
