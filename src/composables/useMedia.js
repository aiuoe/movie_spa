// useMedia — actualmente usa mock, mañana apunta a movie_api (GoFiber / Rust).
// Para activarlo contra la API real, cambiar USE_MOCK = false y apuntar API_BASE.

import { ref, computed } from 'vue'
import * as mock from '@/data/mockMedia'

const USE_MOCK = true
const API_BASE = '/api'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(path) {
  if (USE_MOCK) return null
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
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
        trending.value = t
        movies.value = m
        series.value = s
        continueWatching.value = cw
        hero.value = hp
        top10.value = t10
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
    search
  }
}