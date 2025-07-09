"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addVehicleSchema, type AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { FormProgressBar } from "./form-progress-bar"
import { Step1VehicleDetails } from "./steps/step-1-vehicle-details"
import { Step2AuctionSpecs } from "./steps/step-2-auction-specs"
import { Step3OptionsReview } from "./steps/step-3-options-review"

const steps = [
  {
    id: "step-1",
    title: "Dane pojazdu",
    description: "Wybierz pojazd, dodaj zdjęcia i ustaw podstawowe parametry sprzedaży",
    component: Step1VehicleDetails,
    icon: "🚗",
  },
  {
    id: "step-2",
    title: "Aukcja i specyfikacja",
    description: "Ustaw ceny, lokalizację oraz szczegółowe dane techniczne pojazdu",
    component: Step2AuctionSpecs,
    icon: "⚙️",
  },
  {
    id: "step-3",
    title: "Opcje i publikacja",
    description: "Dodaj opcje finansowania, transportu i opublikuj ogłoszenie",
    component: Step3OptionsReview,
    icon: "🎯",
  },
]

export function AddVehicleForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AddVehicleFormValues>({
    resolver: zodResolver(addVehicleSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      mainCategory: "SAMOCHODY",
      saleType: "Kup Teraz",
      currency: "CHF",
      startingPrice: undefined,
      buyNowPrice: undefined,
      reservePrice: undefined,
      auctionEndDate: undefined,
      minBidIncrement: undefined,
      autoExtend: false,
      brand: "",
      model: "",
      year: undefined,
      mileage: undefined,
      engineCapacity: undefined,
      bodyType: "",
      segment: "",
      motorcycleType: "",
      licenseCategory: "",
      doors: undefined,
      seats: undefined,
      vin: "",
      power: undefined,
      fuelType: "",
      transmission: "",
      driveType: "",
      condition: "",
      ownersCount: undefined,
      hasServiceBook: false,
      accidentFree: true,
      origin: "",
      images: [],
      documents: [],
      location: {
        country: "Szwajcaria",
        city: "",
        postalCode: "",
        lat: undefined,
        lng: undefined,
      },
      financingOptions: [],
      transportOptions: [],
      warranty: false,
      warrantyMonths: undefined,
      // New fields for enhanced functionality
      eurotaxValue: undefined,
      schwackeValue: undefined,
      vinVerified: false,
      transportQuote: undefined,
      leasingAvailable: false,
      paymentMethods: [],
    },
  })

  const processForm = async (values: AddVehicleFormValues) => {
    setIsLoading(true)

    try {
      console.log("Submitting enhanced form values:", values)

      // Simulate API calls for integrations
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Integration calls that would happen here:
      // 1. Upload images to storage with compression
      // 2. Get final vehicle valuation from Eurotax/Schwacke
      // 3. Verify VIN one more time
      // 4. Calculate transport quotes
      // 5. Set up payment methods
      // 6. Create listing in database
      // 7. Send confirmation email
      // 8. Initialize auction if applicable

      alert("🎉 Ogłoszenie zostało dodane pomyślnie!\n\nTwoje ogłoszenie jest już widoczne na platformie MotoAuto.ch")

      // Reset form or redirect to success page
      // router.push('/ogloszenia/sukces')
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("❌ Wystąpił błąd podczas dodawania ogłoszenia. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  type FieldName = keyof AddVehicleFormValues

  const getStepFields = (stepIndex: number): FieldName[] => {
    const fieldGroups: FieldName[][] = [
      // Step 1: Vehicle Details
      [
        "mainCategory",
        "brand",
        "model",
        "year",
        "mileage",
        "engineCapacity",
        "bodyType",
        "segment",
        "motorcycleType",
        "licenseCategory",
        "doors",
        "seats",
        "saleType",
        "images",
        "title",
        "description",
      ],
      // Step 2: Auction & Specs
      [
        "currency",
        "startingPrice",
        "buyNowPrice",
        "reservePrice",
        "auctionEndDate",
        "minBidIncrement",
        "autoExtend",
        "location",
        "vin",
        "power",
        "fuelType",
        "transmission",
        "driveType",
        "condition",
        "ownersCount",
        "hasServiceBook",
        "accidentFree",
        "origin",
      ],
      // Step 3: Options & Review (minimal validation)
      ["financingOptions", "transportOptions", "warranty", "warrantyMonths", "documents"],
    ]

    return fieldGroups[stepIndex] || []
  }

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep)

    if (fieldsToValidate.length > 0) {
      const output = await form.trigger(fieldsToValidate, { shouldFocus: true })
      if (!output) return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1)
    } else {
      await form.handleSubmit(processForm)()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="max-w-6xl mx-auto">
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Enhanced Progress Bar */}
            <FormProgressBar currentStep={currentStep} totalSteps={steps.length} steps={steps} />

            {/* Step Content */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                    {steps[currentStep].icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
                    <CardDescription className="text-base mt-1">{steps[currentStep].description}</CardDescription>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="px-3 py-1">
                      {currentStep + 1} / {steps.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CurrentStepComponent />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t bg-white p-6 rounded-lg shadow-sm">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 bg-transparent"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Wstecz
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="hidden md:flex items-center gap-2">
                  {Array.from({ length: steps.length }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2">
                  Krok {currentStep + 1} z {steps.length}
                </span>
              </div>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publikowanie...
                  </>
                ) : isLastStep ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Opublikuj ogłoszenie
                  </>
                ) : (
                  <>
                    Dalej
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
