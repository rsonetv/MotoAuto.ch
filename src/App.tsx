import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import VehicleDetailPage from "./pages/VehicleDetailPage"
import { VehicleProvider } from "./context/VehicleContext"

function App() {
  return (
    <VehicleProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        </Routes>
      </div>
    </VehicleProvider>
  )
}

export default App
