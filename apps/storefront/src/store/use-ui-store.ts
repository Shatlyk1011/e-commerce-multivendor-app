import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  selectedCity: string
  setSelectedCity: (city: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedCity: 'Туркменабад',
      setSelectedCity: (city) => set({ selectedCity: city }),
    }),
    {
      name: 'ui-storage',
    },
  ),
)
