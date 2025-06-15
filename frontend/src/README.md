# `src` Documentation - SmartChef AI Frontend

This folder contains the UI application code used by `frontend`.

## Overview

The current app is frontend-first with route-level screens and reusable components. Several pages still use local dummy data while backend integration is in progress.

## Folder Map

```txt
src/
├─ components/        # Navbar, route guard, shared UI pieces
├─ context/           # Auth context and provider
├─ data/              # Dummy/mock data for UI flows
├─ pages/             # App screens
├─ services/          # API helpers / service layer entry
├─ App.jsx            # Routes and app shell
├─ main.jsx           # React entry point
├─ index.css          # Global styles + Tailwind imports
└─ App.css            # Root-level app styles
```

## Main Screens

- `Dashboard`
- `Pantry`
- `RecipeGenerator`
- `MyRecipes`
- `RecipeDetail`
- `MealPlanner`
- `ShoppingList`
- `Settings`
- `Login`
- `SignUp`

## Auth and Route Guard

- Auth state lives in `context/AuthContext.jsx`
- Protected routes use `components/ProtectedRoute.jsx`

## Run Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Integration Notes

- Dummy data is currently used for some UI flows.
- API integration should be added incrementally via `services/api.js`.
- Keep UI components decoupled from API calls where possible.
