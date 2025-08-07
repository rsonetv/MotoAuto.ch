import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the type for a single vehicle. 
// Based on the task, I'll include the most important attributes.
// This can be expanded later if needed.
export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine_size: number;
  power: number;
  image_url: string;
};

// Define the state and actions for the comparison store
type ComparisonState = {
  vehicles: Vehicle[];
  addToCompare: (vehicle: Vehicle) => void;
  removeFromCompare: (vehicleId: string) => void;
  clearCompare: () => void;
};

// Create the Zustand store with persistence
export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      vehicles: [],
      addToCompare: (vehicle) =>
        set((state) => {
          // Avoid adding duplicates
          if (state.vehicles.find((v) => v.id === vehicle.id)) {
            return state;
          }
          return { vehicles: [...state.vehicles, vehicle] };
        }),
      removeFromCompare: (vehicleId) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
        })),
      clearCompare: () => set({ vehicles: [] }),
    }),
    {
      name: 'vehicle-comparison-storage', // unique name for localStorage
    }
  )
);