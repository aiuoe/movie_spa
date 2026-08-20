// useMedia — apunta a movie_api (Go + Fiber).
// Las portadas de placehold.co se reemplazan por SVG inline
// para que funcionen incluso si placehold.co está bloqueado en la red.

import { ref, computed } from 'vue'
import * as mock from '@/data/mockMedia'

const USE_MOCK = false
const API_BASE = '/api'

// Provider → tema (color + brand). Mismo que el API.
const PROVIDERS_THEME = {
  Netflix:       { bg: '#e50914', fg: '#ffffff', brand: 'NETFLIX' },
  'Disney+':     { bg: '#0f1e3d', fg: '#ffffff', brand: 'DISNEY+' },
  'HBO Max':     { bg: '#9b51e0', fg: '#ffffff', brand: 'HBO MAX' },
  'Paramount+':  { bg: '#0064ff', fg: '#ffffff', brand: 'PARAMOUNT+' },
  Hulu:          { bg: '#1ce783', fg: '#000000', brand: 'HULU' },
  'Apple TV+':   { bg: '#000000', fg: '#ffffff', brand: 'APPLE TV+' },
  'Prime Video': { bg: '#1399ff', fg: '#ffffff', brand: 'PRIME VIDEO' },
  Demo:          { bg: '#404040', fg: '#ffffff', brand: 'DEMO' },
}

function escapeXML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Genera un poster SVG inline (data URI). No depende de placehold.co.
function localPoster(item, opts = {}) {
  const providers = item?.providers || []
  const primary = providers[0] || 'Streaming'
  const theme = PROVIDERS_THEME[primary] || { bg: '#262626', fg: '#eeeeee', brand: 'STREAMING' }
  const w = opts.w || 500
  const h = opts.h || 750
  const title = (item?.title || '').slice(0, 36)
  const isEstreno = item?.is_estreno
  const isMovie = item?.kind === 'movie'
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>
<rect width='${w}' height='${h}' fill='${theme.bg}'/>
<rect x='15' y='15' width='${w - 30}' height='${h - 30}' fill='none' stroke='${theme.fg}' stroke-opacity='0.3' stroke-width='1.5'/>
<text x='${w / 2}' y='80' font-family='Inter,system-ui,sans-serif' font-size='22' font-weight='800' fill='${theme.fg}' text-anchor='middle' letter-spacing='3'>${escapeXML(theme.brand)}</text>
<text x='${w / 2}' y='${h / 2}' font-family='Inter,system-ui,sans-serif' font-size='26' font-weight='700' fill='${theme.fg}' text-anchor='middle'>${escapeXML(title)}</text>
<text x='${w / 2}' y='${h - 30}' font-family='Inter,system-ui,sans-serif' font-size='12' fill='${theme.fg}' fill-opacity='0.6' text-anchor='middle'>${item?.year || ''}${isMovie ? ' · ' + (item?.duration || '') : ''}</text>
${isEstreno ? `<text x='${w - 30}' y='40' font-family='Inter,system-ui,sans-serif' font-size='10' font-weight='700' fill='#f59e0b' text-anchor='end'>ESTRENO</text>` : ''}
</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(path) {
  if (USE_MOCK) return null
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// Decora items del API con portadas SVG inline si las originales son placehold.co.
function decorate(items) {
  if (!Array.isArray(items)) return items
  return items.map((m) => {
    if (m && m.poster && m.poster.includes('placehold.co')) {
      m.poster = localPoster(m)
    }
    return m
  })
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `API ${res.status}`)
  }
  return res.json()
}

export function useMedia() {
  const loading = ref(false)
  const error = ref(null)

  const trending = ref([])
  const movies = ref([])
  const series = ref([])
  const continueWatching = ref([])
  const hero = ref(null)
  const top10 = ref([])

  async function loadHome() {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        await sleep(80)
        trending.value = mock.trending
        movies.value = mock.movies
        series.value = mock.series
        continueWatching.value = mock.continueWatching
        hero.value = mock.hero
        top10.value = mock.top10
      } else {
        const [t, m, s, cw, hp, t10] = await Promise.all([
          get('/media/trending'),
          get('/media/movies'),
          get('/media/series'),
          get('/me/continue'),
          get('/media/hero'),
          get('/media/top10')
        ])
        trending.value = decorate(t)
        movies.value = decorate(m)
        series.value = decorate(s)
        continueWatching.value = decorate(cw?.map(c => ({...c.media, progress: c.progress, episode: c.episode})) || [])
        hero.value = hp && decorate([hp])[0]
        top10.value = decorate(t10)
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function getById(id) {
    if (USE_MOCK) {
      await sleep(40)
      return mock.getById(id)
    }
    return get(`/media/${id}`)
  }

  async function search(q) {
    if (!q) return []
    if (USE_MOCK) {
      await sleep(60)
      const needle = q.toLowerCase()
      return mock.trending.filter(
        (m) =>
          m.title.toLowerCase().includes(needle) ||
          m.genres.some((g) => g.toLowerCase().includes(needle))
      )
    }
    return get(`/search?q=${encodeURIComponent(q)}`)
  }

  // Búsqueda en TMDB (vía Radarr/Sonarr) — devuelve títulos del mundo
  // entero que podés "pedir" si no están en el catálogo local.
  async function lookup(q, kind = 'movie') {
    if (!q) return []
    const out = await get(`/lookup?kind=${kind}&q=${encodeURIComponent(q)}`)
    return out.results || []
  }

  // "Pedir" un título — lo manda a Radarr/Sonarr para que descargue.
  async function request({ kind, title, external_id }) {
    return post('/request', { kind, title, external_id })
  }

  const hasMovies = computed(() => movies.value.length > 0)
  const hasSeries = computed(() => series.value.length > 0)

  return {
    loading,
    error,
    trending,
    movies,
    series,
    continueWatching,
    hero,
    top10,
    hasMovies,
    hasSeries,
    loadHome,
    getById,
    search,
    lookup,
    request
  }
}