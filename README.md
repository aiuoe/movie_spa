# movie_spa

Self-hosted Netflix-style SPA. Mobile-first, dark theme, grid + carruseles + reproductor.

## Stack

- **Bun** como runtime / package manager
- **Vite** como bundler (HMR rápido)
- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4** (rutas declarativas con lazy-loading)
- **Tailwind CSS 3** (utility-first, mobile-first)
- **Iconify** (`@iconify/vue`) — íconos tree-shakeable on-demand

## Vistas

- `/` — `HomeView`: hero + carruseles horizontales + grid responsivo
- `/watch/:id` — `PlayerView`: reproductor + metadata + lista de episodios (series)
- `/library`, `/search`, `/profile` — placeholders listos para crecer

## Comandos

```bash
bun install
bun run dev      # dev server en http://localhost:5173, proxy /api → :8080
bun run build    # build de producción en /dist
bun run preview  # sirve el build
```

## Estructura

```
src/
├── components/      # MediaCard, Hero, RowCarousel, BottomNav, MediaPlayer…
├── composables/     # useMedia (data fetching, listo para conectar a movie_api)
├── data/            # mockMedia.js — datos de ejemplo hasta enchufar la API
├── router/          # rutas con lazy loading
├── views/           # HomeView, PlayerView, LibraryView, SearchView, ProfileView
├── App.vue
├── main.js
└── style.css        # tailwind + utilidades globales
```

## Próximo paso

Levantar `movie_api` (GoFiber o Rust). El composable `useMedia` ya apunta a `/api/...`
y se puede cambiar por fetch real cuando el backend esté arriba.