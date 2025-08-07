"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { unifiedVehicleSchema, type UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { VehicleBasicInfo } from "./sections/vehicle-basic-info"
import { VehicleSpecs } from "./sections/vehicle-specs"
import { VehiclePricing } from "./sections/vehicle-pricing"
import { VehicleMedia } from "./sections/vehicle-media"
import { VehicleLocation } from "./sections/vehicle-location"
import { VehicleOptions } from "./sections/vehicle-options"
import { AuctionPreviewModal } from "./auction-preview-modal"

export function UnifiedVehicleForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(unifiedVehicleSchema),
    mode: "onChange",
    defaultValues: {
      // Base
      title: "",
      description: "",
      mainCategory: "SAMOCHODY",
      saleType: "Kup Teraz",
      price: undefined,
      currency: "CHF",
      auctionEndDate: undefined,
      minBidIncrement: undefined,
      reservePrice: undefined,
      brand: "",
      model: "",
      year: undefined,
      mileage: undefined,
      engineCapacity: undefined,
      power: undefined,
      fuelType: "",
      transmission: "",
      condition: "",
      accidentFree: true,
      hasServiceBook: false,
      images: [],
      location: {
        country: "Szwajcaria",
        city: "",
        postalCode: "",
      },
      warranty: false,
      warrantyMonths: undefined,

      // Car specific
      bodyType: "",
      driveType: "",
      doors: undefined,
      seats: undefined,
    },
  })

  const processForm = async (values: UnifiedVehicleFormValues) => {
    setIsLoading(true)

    try {
      console.log("Submitting form values:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("🎉 Ogłoszenie zostało dodane pomyślnie!\n\nTwoje ogłoszenie jest już widoczne na platformie MotoAuto.ch")

      // Reset form or redirect
      form.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("❌ Wystąpił błąd podczas dodawania ogłoszenia. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    console.log("Previewing form data:", form.getValues())
    setIsPreviewOpen(true)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <VehicleBasicInfo />
              <VehicleSpecs />
              <VehiclePricing />
            </div>

            {/* Right Column - Media & Additional */}
            <div className="space-y-8">
              <VehicleMedia />
              <VehicleLocation />
              <VehicleOptions />
            </div>
          </div>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="px-12 py-3 text-lg"
                  size="lg"
                >
                  Podgląd
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-12 py-3 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Publikowanie...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Opublikuj ogłoszenie
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      <AuctionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formData={form.getValues()}
      />
    </>
  )
}
