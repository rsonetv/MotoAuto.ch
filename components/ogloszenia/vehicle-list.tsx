"use client"

import { VehicleGrid } from "./vehicle-grid"

export function VehicleList() {
  // Could add category switcher later; default to "auto"
  return (
    <section>
      <VehicleGrid category="auto" />
    </section>
  )
}
