"use client"

import { useState, useEffect } from "react"

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Aktualizuj stan początkowy
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    // Obserwuj zmiany
    const listener = () => setMatches(media.matches)
    
    // Dodaj event listener
    media.addEventListener("change", listener)
    
    // Cleanup
    return () => media.removeEventListener("change", listener)
  }, [matches, query])
  
  return matches
}

export default useMediaQuery;
