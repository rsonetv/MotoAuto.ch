"use client"

import { useState, useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Car, Bike, UploadCloud, X, Loader2, ImageIcon, Wand2, TrendingUp } from "lucide-react"
import Image from "next/image"
import {
  VEHICLE_CATEGORIES,
  VEHICLE_MODELS,
  CAR_BODY_TYPES,
  CAR_SEGMENTS,
  MOTORCYCLE_TYPES,
  MOTORCYCLE_CAPACITIES,
  MOTORCYCLE_LICENSE_CATEGORIES,
} from "@/lib/constants"
import type { AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"

// Enhanced image compression
const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new window.Image()

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export function Step1VehicleDetails() {
  const { control, watch, setValue, getValues } = useFormContext<AddVehicleFormValues>()
  const [brandSearch, setBrandSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [imageFiles, setImageFiles] = useState(getValues("images") || [])
  const [isCompressing, setIsCompressing] = useState(false)
  const [autoTitleGenerated, setAutoTitleGenerated] = useState(false)

  const mainCategory = watch("mainCategory")
  const selectedBrand = watch("brand")
  const selectedModel = watch("model")
  const selectedYear = watch("year")
  const selectedMileage = watch("mileage")
  const saleType = watch("saleType")

  // Auto-generate title when key fields are filled
  const generateAutoTitle = () => {
    if (selectedBrand && selectedModel && selectedYear) {
      const mileageText = selectedMileage ? `, ${selectedMileage.toLocaleString()} km` : ""
      const autoTitle = `${selectedBrand} ${selectedModel}, ${selectedYear}${mileageText}`
      setValue("title", autoTitle)
      setAutoTitleGenerated(true)
    }
  }

  // Enhanced drag and drop for images
  const onDropImages = useCallback(
    async (acceptedFiles: File[]) => {
      setIsCompressing(true)
      const newFiles = []

      for (const file of acceptedFiles) {
        try {
          const compressedFile = await compressImage(file)
          const fileWithPreview = {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            name: file.name,
            size: compressedFile.size,
          }
          newFiles.push(fileWithPreview)
        } catch (error) {
          console.error("Error compressing image:", error)
        }
      }

      const allFiles = [...imageFiles, ...newFiles].slice(0, 12)
      setImageFiles(allFiles)
      setValue("images", allFiles, { shouldValidate: true })
      setIsCompressing(false)
    },
    [imageFiles, setValue],
  )

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setImageFiles(newFiles)
    setValue("images", newFiles, { shouldValidate: true })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    maxFiles: 12,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Get available brands
  const getAvailableBrands = () => {
    if (mainCategory === "SAMOCHODY") {
      return Object.entries(VEHICLE_CATEGORIES.SAMOCHODY).flatMap(([category, brands]) =>
        brands.map((brand) => ({ brand, category })),
      )
    } else if (mainCategory === "MOTOCYKLE") {
      return Object.entries(VEHICLE_CATEGORIES.MOTOCYKLE).flatMap(([category, brands]) =>
        brands.map((brand) => ({ brand, category })),
      )
    } else if (mainCategory === "DOSTAWCZE") {
      return Object.entries(VEHICLE_CATEGORIES.DOSTAWCZE).flatMap(([category, brands]) =>
        brands.map((brand) => ({ brand, category })),
      )
    } else {
      return []
    }
  }

  const filteredBrands = getAvailableBrands().filter(({ brand }) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase()),
  )

  const getModelsForBrand = (brand: string) => {
    return VEHICLE_MODELS[brand as keyof typeof VEHICLE_MODELS] || []
  }

  const filteredModels = getModelsForBrand(selectedBrand).filter((model) =>
    model.toLowerCase().includes(modelSearch.toLowerCase()),
  )

  const getBrandCategory = (brand: string) => {
    const allBrands = getAvailableBrands()
    return allBrands.find((b) => b.brand === brand)?.category || ""
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes("Premium")) return <Star className="h-3 w-3 text-yellow-500" />
    return null
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Premium: "bg-yellow-100 text-yellow-800",
      Główne: "bg-blue-100 text-blue-800",
      Specjalistyczne: "bg-purple-100 text-purple-800",
      Japońskie: "bg-red-100 text-red-800",
      Europejskie: "bg-green-100 text-green-800",
      Amerykańskie: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Kategoria pojazdu</h3>
        <FormField
          control={control}
          name="mainCategory"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-16 p-1">
                    <TabsTrigger value="SAMOCHODY" className="text-base font-medium h-full">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Samochody
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="MOTOCYKLE" className="text-base font-medium h-full">
                      <div className="flex items-center gap-2">
                        <Bike className="h-5 w-5" />
                        Motocykle
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="DOSTAWCZE" className="text-base font-medium h-full">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Dostawcze
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {mainCategory === "SAMOCHODY" ? (
              <Car className="h-5 w-5 text-blue-600" />
            ) : mainCategory === "MOTOCYKLE" ? (
              <Bike className="h-5 w-5 text-green-600" />
            ) : (
              <Car className="h-5 w-5 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              Wybierz{" "}
              {mainCategory === "SAMOCHODY" ? "samochód" : mainCategory === "MOTOCYKLE" ? "motocykl" : "dostawcze"}
            </h3>
          </div>

          {/* Brand Selection */}
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka *</FormLabel>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Szukaj marki..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {filteredBrands.map(({ brand, category }) => (
                      <Button
                        key={brand}
                        type="button"
                        variant={field.value === brand ? "default" : "outline"}
                        className="justify-between h-auto p-4"
                        onClick={() => {
                          field.onChange(brand)
                          setValue("model", "")
                          setBrandSearch("")
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium">{brand}</span>
                        </div>
                        <Badge className={getCategoryColor(category)} variant="secondary">
                          {category}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model Selection */}
          {selectedBrand && (
            <FormField
              control={control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Szukaj modelu..."
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {filteredModels.map((model) => (
                        <Button
                          key={model}
                          type="button"
                          variant={field.value === model ? "default" : "outline"}
                          className="justify-start h-auto p-4"
                          onClick={() => {
                            field.onChange(model)
                            setModelSearch("")
                          }}
                        >
                          <span className="font-medium">{model}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rok produkcji *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        generateAutoTitle()
                      }}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przebieg (km) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 50000"
                      min="0"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        generateAutoTitle()
                      }}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category-specific fields */}
          {mainCategory === "SAMOCHODY" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność silnika (cm³) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="np. 2000"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nadwozie *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Wybierz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CAR_BODY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segment *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Wybierz segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAR_SEGMENTS.map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : mainCategory === "MOTOCYKLE" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Wybierz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTORCYCLE_CAPACITIES.map((capacity) => (
                            <SelectItem key={capacity} value={capacity}>
                              {capacity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="motorcycleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ motocykla *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Wybierz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTORCYCLE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="licenseCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria prawa jazdy *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOTORCYCLE_LICENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : mainCategory === "DOSTAWCZE" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność silnika (cm³) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="np. 2000"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ) : null}

          {/* Sale Type */}
          <FormField
            control={control}
            name="saleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ sprzedaży *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Wybierz typ sprzedaży" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Aukcja">
                      <div className="flex flex-col text-left">
                        <span className="font-medium">🔨 Aukcja</span>
                        <span className="text-sm text-gray-500">Licytacja z ceną wywoławczą</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Kup Teraz">
                      <div className="flex flex-col text-left">
                        <span className="font-medium">💰 Kup Teraz</span>
                        <span className="text-sm text-gray-500">Sprzedaż za stałą cenę</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Zdjęcia pojazdu</h3>
            <Badge variant="outline">{imageFiles.length}/12</Badge>
          </div>

          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isCompressing ? (
                    <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                  ) : (
                    <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />
                  )}
                  <p className="mb-2 text-lg font-medium text-gray-700">
                    {isCompressing ? "Kompresowanie zdjęć..." : isDragActive ? "Upuść zdjęcia tutaj" : "Dodaj zdjęcia"}
                  </p>
                  {!isCompressing && (
                    <p className="text-sm text-gray-500 text-center">
                      Przeciągnij i upuść lub kliknij, aby wybrać
                      <br />
                      PNG, JPG, WEBP (max 10MB każde)
                    </p>
                  )}
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Podgląd zdjęć</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        imageFiles.forEach((file) => URL.revokeObjectURL(file.preview))
                        setImageFiles([])
                        setValue("images", [])
                      }}
                    >
                      Usuń wszystkie
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageFiles.map((fileWithPreview, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square">
                          <Image
                            src={fileWithPreview.preview || "/placeholder.svg"}
                            alt={`Podgląd ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            onLoad={() => URL.revokeObjectURL(fileWithPreview.preview)}
                          />
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">Główne</Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500 truncate">{fileWithPreview.name}</p>
                          <p className="text-xs text-gray-400">{(fileWithPreview.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Title and Description */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Opis ogłoszenia</h3>
          {autoTitleGenerated && (
            <Badge variant="secondary" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              Auto-generowany
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł ogłoszenia *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={`np. ${selectedBrand ? `${selectedBrand} ${selectedModel || "Model"}, ${selectedYear || "Rok"}` : "BMW Seria 3 320d, 2020, Idealny stan"}`}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        setAutoTitleGenerated(false)
                      }}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAutoTitle}
                    disabled={!selectedBrand || !selectedModel || !selectedYear}
                    className="px-4 bg-transparent"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Atrakcyjny tytuł zwiększa zainteresowanie o 40%</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Szczegółowy opis *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Opisz szczegółowo swój ${mainCategory === "SAMOCHODY" ? "samochód" : mainCategory === "MOTOCYKLE" ? "motocykl" : "dostawcze"}...

Przykład:
- Stan techniczny i wizualny
- Historia serwisowa  
- Wyposażenie dodatkowe
- Powód sprzedaży
- Możliwość oględzin`}
                    rows={8}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="text-base resize-none"
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Szczegółowy opis zwiększa zaufanie kupujących</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Market Insights */}
      {selectedBrand && selectedModel && selectedYear && (
        <Alert className="border-blue-200 bg-blue-50">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-1">
              Analiza rynku dla {selectedBrand} {selectedModel}
            </div>
            <div className="text-sm space-y-1">
              <div>• Średnia cena na rynku: Zostanie wyliczona w następnym kroku</div>
              <div>• Czas sprzedaży: ~14 dni dla tej kategorii</div>
              <div>• Popularność: Wysoka w kategorii {getBrandCategory(selectedBrand)}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
