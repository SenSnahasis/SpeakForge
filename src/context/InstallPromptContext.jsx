import React, { createContext, useContext } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const InstallPromptContext = createContext(null)

// Mounted once at the app root (see main.jsx) rather than inside Settings,
// since the browser's `beforeinstallprompt` event can fire on whichever page
// happens to load first — capturing it only while Settings is open would
// miss it if the user opens Settings later, leaving the "Install App"
// button unable to actually trigger anything.
export function InstallPromptProvider({ children }) {
  const value = useInstallPrompt()
  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>
}

export function useInstallPromptContext() {
  const ctx = useContext(InstallPromptContext)
  if (!ctx) throw new Error('useInstallPromptContext must be used within InstallPromptProvider')
  return ctx
}
