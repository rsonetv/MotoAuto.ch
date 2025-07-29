"use client"

import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X, MapPin, ImageIcon, FileText, Loader2 } from "lucide-react"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { COUNTRIES, FINANCING_OPTIONS, TRANSPORT_OPTIONS } from "@/lib/constants"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

interface FileWithPreview {
  file: File;
  preview: string;
  name: string;
  size: number;
}

// Image compression utility
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new globalThis.Image()

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

export function Step4Media() {
  const { control, setValue, getValues, watch } = useFormContext()
  const [imageFiles, setImageFiles] = useState(getValues("images") || [])
  const [documentFiles, setDocumentFiles] = useState(getValues("documents") || [])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isCompressing, setIsCompressing] = useState(false)

  const onDropImages = useCallback(
    async (acceptedFiles: File[]) => {
      setIsCompressing(true)
      const newFiles = []

      for (const file of acceptedFiles) {
        try {
          // Compress image
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

  const onDropDocuments = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }))

      const allFiles = [...documentFiles, ...newFiles].slice(0, 5)
      setDocumentFiles(allFiles)
      setValue("documents", allFiles, { shouldValidate: true })
    },
    [documentFiles, setValue],
  )

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setImageFiles(newFiles)
    setValue("images", newFiles, { shouldValidate: true })
  }

  const removeDocument = (index: number) => {
    const newFiles = [...documentFiles]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setDocumentFiles(newFiles)
    setValue("documents", newFiles, { shouldValidate: true })
  }

  const {
    getRootProps: getImagesRootProps,
    getInputProps: getImagesInputProps,
    isDragActive: isImagesDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    maxFiles: 12,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const {
    getRootProps: getDocumentsRootProps,
    getInputProps: getDocumentsInputProps,
    isDragActive: isDocumentsDragActive,
  } = useDropzone({
    onDrop: onDropDocuments,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  return (
    <div className="space-y-8">
      {/* Upload zdjęć */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Zdjęcia pojazdu
          </CardTitle>
          <CardDescription>
            Dodaj do 12 wysokiej jakości zdjęć. Pierwsze zdjęcie będzie głównym zdjęciem ogłoszenia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Zdjęcia (max 12) *</span>
                  <Badge variant="outline">{imageFiles.length}/12</Badge>
                </FormLabel>
                <FormControl>
                  <div
                    {...getImagesRootProps()}
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isImagesDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <input {...getImagesInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isCompressing ? (
                        <Loader2 className="w-10 h-10 mb-3 text-blue-500 animate-spin" />
                      ) : (
                        <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                      )}
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {isCompressing ? "Kompresowanie zdjęć..." : "Kliknij, aby przesłać"}
                        </span>
                        {!isCompressing && " lub przeciągnij i upuść"}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (max 10MB każde, automatyczna kompresja)</p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {imageFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Podgląd zdjęć</h4>
                <p className="text-sm text-gray-500">Przeciągnij, aby zmienić kolejność</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageFiles.map((fileWithPreview: FileWithPreview, index: number) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={fileWithPreview.preview || "/placeholder.svg"}
                        alt={`Podgląd ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                        onLoad={() => URL.revokeObjectURL(fileWithPreview.preview)}
                      />
                      {index === 0 && <Badge className="absolute top-2 left-2 bg-blue-600">Główne</Badge>}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{fileWithPreview.name}</p>
                    <p className="text-xs text-gray-400">{(fileWithPreview.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload dokumentów */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dokumenty pojazdu
          </CardTitle>
          <CardDescription>
            Dodaj dokumenty takie jak homologacja, przeglądy, ubezpieczenie (opcjonalne)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getDocumentsRootProps()}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDocumentsDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <input {...getDocumentsInputProps()} />
            <div className="flex flex-col items-center justify-center py-4">
              <FileText className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Kliknij, aby dodać dokumenty</span> lub przeciągnij PDF
              </p>
              <p className="text-xs text-gray-500">PDF (max 5MB każdy, max 5 plików)</p>
            </div>
          </div>

          {documentFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Dodane dokumenty</h4>
              {documentFiles.map((doc: FileWithPreview, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lokalizacja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lokalizacja pojazdu
          </CardTitle>
          <CardDescription>Określ lokalizację pojazdu dla potencjalnych kupujących</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="location.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kraj *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Wybierz kraj" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
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
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miasto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="np. Zurych, Genewa"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="location.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod pocztowy</FormLabel>
                <FormControl>
                  <Input
                    placeholder="np. 8001"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-12 text-base w-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Placeholder dla mapy */}
          <div className="space-y-2">
            <FormLabel>Mapa lokalizacji</FormLabel>
            <div className="flex items-center justify-center w-full h-64 border rounded-lg bg-gray-100">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Integracja z mapą (wkrótce)</p>
                <p className="text-sm text-gray-400">Mapbox/Leaflet integration</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opcje dodatkowe */}
      <Card>
        <CardHeader>
          <CardTitle>Opcje dodatkowe</CardTitle>
          <CardDescription>Dodatkowe usługi i opcje dla kupujących</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Finansowanie */}
          <FormField
            control={control}
            name="financingOptions"
            render={() => (
              <FormItem>
                <FormLabel>Opcje finansowania</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FINANCING_OPTIONS.map((option) => (
                    <FormField
                      key={option}
                      control={control}
                      name="financingOptions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                if (checked) {
                                  field.onChange([...current, option])
                                } else {
                                  field.onChange(current.filter((item: string) => item !== option))
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{option}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transport */}
          <FormField
            control={control}
            name="transportOptions"
            render={() => (
              <FormItem>
                <FormLabel>Opcje transportu</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TRANSPORT_OPTIONS.map((option) => (
                    <FormField
                      key={option}
                      control={control}
                      name="transportOptions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                if (checked) {
                                  field.onChange([...current, option])
                                } else {
                                  field.onChange(current.filter((item: string) => item !== option))
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{option}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gwarancja */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="warranty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Gwarancja</FormLabel>
                    <p className="text-sm text-gray-500">Pojazd objęty jest gwarancją</p>
                  </div>
                </FormItem>
              )}
            />

            {watch("warranty") && (
              <FormField
                control={control}
                name="warrantyMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Okres gwarancji (miesiące)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="np. 12"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        className="h-12 text-base"
                        min="1"
                        max="60"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informacje o opłatach */}
      <Alert>
        <AlertDescription>
          <strong>Informacja o opłatach:</strong> Za publikację ogłoszenia pobierana jest opłata w wysokości 2.5% od
          ceny sprzedaży (min. 50 CHF). Opłata jest pobierana tylko w przypadku udanej sprzedaży.
        </AlertDescription>
      </Alert>
    </div>
  )
}
