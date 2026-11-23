'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@features/Account/Frontend/types';

export interface ActivityFilterState {
  pageNumber: number;
  pageSize: number;
  filter: string;
  category: string;
  city: string;
  pricing: 'all' | 'free' | 'paid';
  sortBy: 'hot' | 'date' | 'popular' | 'priceAsc' | 'priceDesc';
  savedOnly: boolean;
  viewMode: 'cards' | 'map';
  startDate: string | null;
  search: string;
}

const DEFAULT_FILTERS: ActivityFilterState = {
  pageNumber: 1,
  pageSize: 6,
  filter: 'all',
  category: 'all',
  city: 'all',
  pricing: 'all',
  sortBy: 'hot',
  savedOnly: false,
  viewMode: 'cards',
  startDate: null,
  search: '',
};

interface AppStoreState {
  user: User | null;
  bookmarks: string[];
  filters: ActivityFilterState;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  toggleBookmark: (activityId: string) => void;
  setFilter: <K extends keyof ActivityFilterState>(key: K, value: ActivityFilterState[K]) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      user: null,
      bookmarks: [],
      filters: DEFAULT_FILTERS,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      toggleBookmark: (activityId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(activityId)
            ? state.bookmarks.filter((id) => id !== activityId)
            : [...state.bookmarks, activityId],
        })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
            ...(key !== 'pageNumber' ? { pageNumber: 1 } : {}),
          },
        })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'devmeet-global-store',
      partialize: (state) => ({
        user: state.user,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
