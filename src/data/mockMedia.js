// Mock catalog — se reemplaza por /api/movies, /api/series cuando movie_api esté arriba.
// Imágenes vía picsum (placeholder estable, sin claves externas).

const img = (seed, w = 800, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`
const backdrop = (seed) => `https://picsum.photos/seed/${seed}-bg/1920/1080`

const sample = (id, title, year, rating, duration, kind, genres, backdropSeed) => ({
  id,
  title,
  year,
  rating,
  duration,
  kind, // 'movie' | 'series'
  genres,
  poster: img(`m-${id}`),
  backdrop: backdrop(backdropSeed || `m-${id}`),
  overview:
    'Lorem ipsum dolor sit amet consectetur. Película / serie del catálogo local con metadata scrapeada automáticamente por el stack *arr.',
  source: '/api/media/sample.mp4' // cuando esté movie_api, aquí va la URL real del stream
})

export const trending = [
  sample('tt-001', 'Neón Silencioso', 2024, 8.4, '2h 14m', 'movie', ['Sci-Fi', 'Thriller'], 'neon'),
  sample('tt-002', 'La Última Estación', 2023, 7.9, '1h 58m', 'movie', ['Drama'], 'station'),
  sample('tt-003', 'Código Eclipse', 2024, 8.1, 'Serie', 'series', ['Sci-Fi', 'Misterio'], 'eclipse'),
  sample('tt-004', 'Hielo Rojo', 2022, 7.4, '1h 47m', 'movie', ['Acción'], 'ice'),
  sample('tt-005', 'Senderos', 2024, 8.0, 'Serie', 'series', ['Drama', 'Aventura'], 'trail'),
  sample('tt-006', 'Niebla', 2023, 7.2, '1h 33m', 'movie', ['Terror'], 'mist'),
  sample('tt-007', 'Voltaje', 2025, 8.6, 'Serie', 'series', ['Acción', 'Sci-Fi'], 'volt'),
  sample('tt-008', 'Crisálida', 2024, 7.8, '2h 02m', 'movie', ['Drama', 'Romance'], 'cris'),
  sample('tt-009', 'Mar de Estrellas', 2023, 8.3, 'Serie', 'series', ['Aventura', 'Sci-Fi'], 'sea'),
  sample('tt-010', 'Raíz', 2024, 7.6, '1h 50m', 'movie', ['Thriller'], 'root')
]

export const movies = trending.filter((m) => m.kind === 'movie')
export const series = trending.filter((m) => m.kind === 'series')

export const continueWatching = [
  { ...trending[0], progress: 0.42, episode: 'T1 · E3' },
  { ...trending[2], progress: 0.78, episode: 'T2 · E5' },
  { ...trending[4], progress: 0.15, episode: 'T1 · E1' },
  { ...trending[6], progress: 0.93, episode: 'T3 · E8' }
]

export const top10 = trending.slice(0, 10)

export const hero = {
  ...trending[0],
  backdrop: backdrop('hero'),
  tagline: 'Una historia que cruza el tiempo y la memoria.',
  seasons: 1
}

// Detalle “completo” para el player view.
export function getById(id) {
  const found = trending.find((m) => m.id === id)
  if (!found) return null
  return {
    ...found,
    cast: ['A. Vega', 'L. Cruz', 'M. Soto', 'R. Lima', 'C. Reyes'],
    director: 'I. Martín',
    seasons: found.kind === 'series' ? 3 : 1,
    episodes:
      found.kind === 'series'
        ? Array.from({ length: 8 }, (_, i) => ({
            id: `${found.id}-e${i + 1}`,
            title: `Episodio ${i + 1}`,
            duration: '45m',
            thumb: img(`ep-${found.id}-${i}`, 400, 220),
            overview: 'Lorem ipsum del episodio. Sinopsis scrapeada por Sonarr.'
          }))
        : [],
    similar: trending.filter((m) => m.id !== id).slice(0, 6)
  }
}

export const featured = {
  movies,
  series,
  trending
}