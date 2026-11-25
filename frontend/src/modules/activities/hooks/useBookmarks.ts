'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/core/store/useAppStore';

export function useBookmarks() {
  const bookmarks = useAppStore((s) => s.bookmarks);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);

  const isBookmarked = useCallback(
    (activityId: string) => bookmarks.includes(activityId),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked };
}
