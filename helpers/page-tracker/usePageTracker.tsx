'use client'

import { useSyncExternalStore } from 'react'
import type { PageTrackerState } from './types'

const INITIAL_STATE: PageTrackerState = {
  pageIndex: 0,
  referrer: '',
  pageEvent: undefined,
  isFirstPage: true,
  isLastPage: true,
  pageHistory: [],
  pageHistoryLength: 0,
}

export const pageTrackerStore = {
  state: {
    ...INITIAL_STATE,
  } as PageTrackerState,
  listeners: new Set<() => void>(),

  getState(): PageTrackerState {
    return this.state
  },

  getImmutablePageHistory(): PageTrackerState['pageHistory'] {
    return this.state.pageHistory.slice()
  },

  setState: (newState: Partial<PageTrackerState>) => {
    pageTrackerStore.state = {
      ...pageTrackerStore.state,
      ...newState,
    } as PageTrackerState
    requestAnimationFrame(() => {
      pageTrackerStore.listeners.forEach((listener) => listener())
    })
  },

  subscribe: (listener: () => void) => {
    pageTrackerStore.listeners.add(listener)
    return () => pageTrackerStore.listeners.delete(listener) // 返回取消訂閱的函數
  },
}

/**
 * get PageTrackerStore in any function.
 **/
export const getPageTrackerStore = () => {
  return pageTrackerStore.getState()
}

export const usePageTracker = (selector) => {
  let lastSelected

  return useSyncExternalStore(
    pageTrackerStore.subscribe,
    () => {
      const selected = selector(pageTrackerStore.getState())

      if (JSON.stringify(lastSelected) !== JSON.stringify(selected)) {
        lastSelected = selected
      }
      return lastSelected
    },
    () => selector(pageTrackerStore.getState()),
  )
}
