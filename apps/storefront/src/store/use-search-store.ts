import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SearchState {
  history: string[]
  addHistory: (query: string) => void
  clearHistory: () => void
  removeHistoryItem: (query: string) => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (query) =>
        set((state) => {
          const trimmed = query.trim()
          if (!trimmed) return {}
          const filtered = state.history.filter((item) => item !== trimmed)
          return { history: [trimmed, ...filtered].slice(0, 10) }
        }),
      clearHistory: () => set({ history: [] }),
      removeHistoryItem: (query) =>
        set((state) => ({
          history: state.history.filter((item) => item !== query),
        })),
    }),
    {
      name: 'search-storage',
    },
  ),
)
