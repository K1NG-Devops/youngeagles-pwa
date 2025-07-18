"use client"

/**
 * Minimal implementation to satisfy build-time imports.
 * Replace this with your full SubscriptionContext later.
 */

import { createContext, useContext } from "react"

const SubscriptionContext = createContext({
  /* defaults */
  subscription: null,
  loading: false,
  error: null,
  features: {},
  getCurrentPlan: () => ({ features: { ads_enabled: true } }),
})

/* ----  Named Exports expected by the app  ---- */

export const SubscriptionProvider = ({ children }) => (
  <SubscriptionContext.Provider value={{}}>{children}</SubscriptionContext.Provider>
)

export const useSubscription = () => useContext(SubscriptionContext)
