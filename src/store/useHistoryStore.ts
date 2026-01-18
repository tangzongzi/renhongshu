import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  url: string
  postId: string
  title: string
  content: string
  tags: string[]
  imageCount: number
  createdAt: Date
  status: 'completed' | 'draft'
}

interface HistoryState {
  items: HistoryItem[]
  
  addItem: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void
  removeItem: (id: string) => void
  clearHistory: () => void
  getRecentItems: (limit?: number) => HistoryItem[]
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date(),
        }
        set((state) => ({
          items: [newItem, ...state.items],
        }))
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      clearHistory: () => set({ items: [] }),
      
      getRecentItems: (limit = 10) => {
        return get().items.slice(0, limit)
      },
    }),
    {
      name: 'history-storage',
    }
  )
)
