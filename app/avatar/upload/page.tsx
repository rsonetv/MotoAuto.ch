"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, X, Check } from "lucide-react"

interface UploadResponse {
  success: boolean
  blob?: {
    url: string
    pathname: string
    size: number
    uploadedAt: string
  }
  originalFilename?: string
  uniqueFilename?: string
  contentType?: string
  error?: string
  details?: string
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState<UploadResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please select a JPEG, PNG, WebP, or GIF image.")
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.")
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const file = inputFileRef.current?.files?.[0]
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch(`/api/avatar/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: UploadResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      setBlob(result)
      setPreviewUrl(null) // Clear preview since we now have the uploaded image
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setBlob(null)
    setPreviewUrl(null)
    setError(null)
    if (inputFileRef.current) {
      inputFileRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Upload Your Avatar
          </CardTitle>
          <CardDescription>
            Upload a profile picture. Supported formats: JPEG, PNG, WebP, GIF (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {blob?.success ? (
            <div className="space-y-4">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>File uploaded successfully!</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="aspect-square w-48 mx-auto overflow-hidden rounded-lg border">
                  <img
                    src={blob.blob?.url || "/placeholder.svg"}
                    alt="Uploaded avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Original filename:</strong> {blob.originalFilename}
                  </div>
                  <div>
                    <strong>Unique filename:</strong> {blob.uniqueFilename}
                  </div>
                  <div>
                    <strong>Size:</strong> {blob.blob?.size ? (blob.blob.size / 1024).toFixed(1) + " KB" : "Unknown"}
                  </div>
                  <div>
                    <strong>Content type:</strong> {blob.contentType}
                  </div>
                  <div>
                    <strong>URL:</strong>{" "}
                    <a
                      href={blob.blob?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {blob.blob?.url}
                    </a>
                  </div>
                </div>

                <Button onClick={resetForm} variant="outline" className="w-full bg-transparent">
                  Upload Another File
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select Image File</Label>
                <Input
                  id="file"
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  required
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-square w-48 mx-auto overflow-hidden rounded-lg border">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">{uploadProgress}% uploaded</p>
                </div>
              )}

              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
