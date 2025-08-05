"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Download,
  Share
} from "lucide-react"
import Image from "next/image"
import { useSwipeGestures } from "../hooks/useSwipeGestures"
import { MediaItem, EnhancedGalleryProps } from "../schema"
import { formatMediaDuration } from "../string-formatters"

export function EnhancedVehicleGallery({
  images,
  title,
  hasVirtualTour,
  supportsPinchZoom,
  lazyLoadingEnabled,
  onImageChange,
  onFullscreenToggle
}: EnhancedGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})

  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const validImages = images && images.length > 0 ? images : []
  const currentMedia = validImages[selectedImage]

  // Swipe gesture handling
  const swipeRef = useSwipeGestures({
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
    onPinchZoom: supportsPinchZoom ? handlePinchZoom : undefined
  }, {
    threshold: 50,
    preventDefaultTouchmoveEvent: true
  })

  function nextImage() {
    const newIndex = (selectedImage + 1) % validImages.length
    setSelectedImage(newIndex)
    onImageChange?.(newIndex)
  }

  function prevImage() {
    const newIndex = (selectedImage - 1 + validImages.length) % validImages.length
    setSelectedImage(newIndex)
    onImageChange?.(newIndex)
  }

  function handlePinchZoom(scale: number) {
    if (supportsPinchZoom && currentMedia?.type === 'image') {
      setZoomLevel(Math.max(1, Math.min(3, scale)))
    }
  }

  function handleImageLoad(index: number) {
    setLoadingStates(prev => ({ ...prev, [index]: false }))
  }

  function handleImageLoadStart(index: number) {
    setLoadingStates(prev => ({ ...prev, [index]: true }))
  }

  function toggleFullscreen() {
    setLightboxOpen(!lightboxOpen)
    onFullscreenToggle?.(!lightboxOpen)
  }

  function handleVideoTimeUpdate() {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
    }
  }

  function togglePlayPause() {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  function handleRotate() {
    setRotation(prev => (prev + 90) % 360)
  }

  function resetZoomAndRotation() {
    setZoomLevel(1)
    setRotation(0)
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxOpen) {
        switch (e.key) {
          case 'ArrowLeft':
            prevImage()
            break
          case 'ArrowRight':
            nextImage()
            break
          case 'Escape':
            setLightboxOpen(false)
            break
          case ' ':
            if (currentMedia?.type === 'video') {
              e.preventDefault()
              togglePlayPause()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentMedia])

  if (validImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Brak zdjęć</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div 
        ref={swipeRef}
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted group gallery-container touch-optimized"
      >
        {currentMedia?.type === 'video' ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="w-full h-full object-cover"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadStart={() => handleImageLoadStart(selectedImage)}
              onLoadedData={() => handleImageLoad(selectedImage)}
              muted={isMuted}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20 touch-optimized"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 touch-optimized"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1">
                  <Progress value={videoProgress} className="h-2" />
                </div>
                
                <span className="text-white text-sm">
                  {currentMedia.duration ? formatMediaDuration(currentMedia.duration) : ''}
                </span>
              </div>
            </div>
          </div>
        ) : currentMedia?.type === '360' ? (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-semibold">Widok 360°</p>
              <p className="text-sm opacity-80">Przeciągnij aby obracać</p>
            </div>
            <Badge className="absolute top-4 left-4 bg-purple-600 text-white">
              360°
            </Badge>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {loadingStates[selectedImage] && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="skeleton w-full h-full" />
              </div>
            )}
            <Image
              ref={imageRef}
              src={currentMedia?.url || ''}
              alt={`${title} - ${currentMedia?.caption || `zdjęcie ${selectedImage + 1}`}`}
              fill
              className={`gallery-image object-cover transition-transform duration-300`}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
              }}
              priority={selectedImage === 0}
              onLoadStart={() => handleImageLoadStart(selectedImage)}
              onLoad={() => handleImageLoad(selectedImage)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 touch-optimized opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 touch-optimized opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Top Controls */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentMedia?.type === 'image' && supportsPinchZoom && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 text-white hover:bg-black/70 touch-optimized"
              onClick={handleRotate}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70 touch-optimized"
            onClick={toggleFullscreen}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2">
          {currentMedia?.type === 'video' && (
            <Badge className="bg-red-600 text-white">
              <Play className="h-3 w-3 mr-1" />
              Video
            </Badge>
          )}
          {currentMedia?.type === '360' && (
            <Badge className="bg-purple-600 text-white">
              360°
            </Badge>
          )}
          {hasVirtualTour && (
            <Badge className="bg-blue-600 text-white ml-2">
              Wirtualny spacer
            </Badge>
          )}
        </div>

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
            {selectedImage + 1} / {validImages.length}
          </div>
        )}

        {/* Zoom Level Indicator */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {validImages.map((media, index) => (
              <button
                key={index}
                className={`gallery-thumbnail relative aspect-[4/3] w-20 overflow-hidden rounded border-2 transition-all touch-optimized shrink-0 ${
                  selectedImage === index 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedImage(index)
                  onImageChange?.(index)
                  resetZoomAndRotation()
                }}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                ) : media.type === '360' ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <RotateCcw className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <Image
                    src={media.url}
                    alt={`${title} - miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
                
                {/* Media type indicator */}
                {media.type !== 'image' && (
                  <div className="absolute top-1 right-1">
                    <Badge className="text-xs px-1 py-0">
                      {media.type === 'video' ? 'V' : '360'}
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Fullscreen Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 bg-black">
          <div className="relative w-full h-full">
            {currentMedia?.type === 'video' ? (
              <video
                src={currentMedia.url}
                className="w-full h-full object-contain"
                controls
                autoPlay={isPlaying}
              />
            ) : currentMedia?.type === '360' ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <RotateCcw className="h-16 w-16 mx-auto mb-6 animate-spin" />
                  <p className="text-2xl font-semibold mb-2">Widok 360°</p>
                  <p className="text-lg opacity-80">Przeciągnij aby obracać widok</p>
                </div>
              </div>
            ) : (
              <Image
                src={currentMedia?.url || ''}
                alt={`${title} - pełny rozmiar`}
                fill
                className="object-contain"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                }}
              />
            )}
            
            {/* Lightbox Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {currentMedia?.type === 'image' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 touch-optimized"
                    onClick={handleRotate}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 touch-optimized"
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 touch-optimized"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Navigation in Lightbox */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 touch-optimized"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 touch-optimized"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded">
                  {selectedImage + 1} / {validImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}