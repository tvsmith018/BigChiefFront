"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

/**
 * All UI-only state for navigation lives here
 */
interface NavigationUIState {
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const NavigationUIContext = createContext<NavigationUIState | undefined>(
  undefined
);

export function NavigationUIProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleSearch = useCallback(() => setSearchOpen((prev) => !prev), []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []); 
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  useEffect(()=>{
    
  })

  return (
    <NavigationUIContext.Provider
      value={{
        isSearchOpen,
        isMenuOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        openMenu,
        closeMenu,
        toggleMenu,
      }}
    >
      {children}
    </NavigationUIContext.Provider>
  );
}

/**
 * Safe consumer hook
 */
export function useNavigationUI() {
  const context = useContext(NavigationUIContext);

  if (!context) {
    throw new Error(
      "useNavigationUI must be used within NavigationUIProvider"
    );
  }

  return context;
}
