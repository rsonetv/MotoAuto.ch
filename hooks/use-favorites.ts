import { useLocalStorage } from "./use-local-storage"

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("motoauto-favorites", [])
  
  const addToFavorites = (vehicleId: string) => {
    setFavorites(prev => [...prev, vehicleId])
  }
  
  const removeFromFavorites = (vehicleId: string) => {
    setFavorites(prev => prev.filter(id => id !== vehicleId))
  }
  
  const toggleFavorite = (vehicleId: string) => {
    if (favorites.includes(vehicleId)) {
      removeFromFavorites(vehicleId)
    } else {
      addToFavorites(vehicleId)
    }
  }
  
  const isFavorite = (vehicleId: string) => {
    return favorites.includes(vehicleId)
  }
  
  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
  }
}