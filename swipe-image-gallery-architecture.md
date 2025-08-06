# Swipe Image Gallery Architecture

This document outlines the architecture for the "Swipe Image Gallery" component.

## 1. Component Breakdown

The gallery will be composed of the following React components:

-   **`ImageGallery`**: The root component that orchestrates the entire gallery, managing state and composing the other components.
-   **`Carousel`**: The core of the gallery, built using **Embla Carousel**. It handles the horizontal swipe gestures for navigating between images.
-   **`ZoomableImage`**: A wrapper around the Next.js `Image` component. It will use `react-use-gesture` to implement pinch-to-zoom and double-tap-to-zoom functionality.
-   **`ThumbnailStrip`**: A horizontally scrollable strip of thumbnails that allows for quick navigation. Each thumbnail will be a clickable element that updates the main carousel's active slide.
-   **`Lightbox`**: A fullscreen modal that provides an immersive viewing experience. It will feature a dark, semi-transparent overlay and house the main carousel, image counter, and other UI controls.
-   **`ImageCounter`**: A simple UI element that displays the current image index and the total number of images (e.g., "1/15").
-   **`ShareButton`**: A button that utilizes the **Web Share API** to allow users to share the current image.
-   **`DownloadButton`**: A button that enables users to download the high-resolution version of the current image directly from **Supabase Storage**.
-   **`LoadingSkeleton`**: A placeholder component that provides visual feedback while images are being loaded. This will be used for both the main images and the thumbnails.
-   **`GestureHint`**: A UI element that provides a visual cue to the user about available gestures, such as a "pinch to zoom" hint that appears briefly.
-   **`ThreeSixtyViewer`**: A dedicated component for rendering 360° photos. It will be conditionally rendered in place of the standard `ZoomableImage` when a 360° image is detected.

## 2. State Management

We will use **Zustand** for state management to keep the component's state organized and accessible. A central store, `useGalleryStore`, will be created with the following state and actions:

-   **State:**
    -   `images: Image[]`: An array of image objects, where each object contains the image URL, alt text, thumbnail URL, and a flag for 360° content.
    -   `currentIndex: number`: The index of the currently active image.
    -   `isLightboxOpen: boolean`: Controls the visibility of the `Lightbox` component.
    -   `zoomLevel: number`: The current zoom level of the image in the `ZoomableImage` component.
    -   `isZoomed: boolean`: A flag to quickly determine if the image is zoomed in.

-   **Actions:**
    -   `setImages(images: Image[])`: To initialize the gallery with images.
    -   `setCurrentIndex(index: number)`: To change the active image.
    -   `openLightbox(index: number)`: To open the lightbox, optionally at a specific image index.
    -   `closeLightbox()`: To close the lightbox.
    -   `setZoomLevel(level: number)`: To update the zoom level.

## 3. Gesture Handling

-   **Horizontal Swipe:** This will be handled out-of-the-box by **Embla Carousel**.
-   **Pinch-to-Zoom & Double-Tap-to-Zoom:** These gestures will be implemented on the `ZoomableImage` component using the **`react-use-gesture`** library. The library's hooks will be used to capture pinch and tap gestures, which will then update the `zoomLevel` in our Zustand store.

## 4. Performance Strategy

-   **Lazy Loading:** The Next.js `Image` component's `loading="lazy"` prop will be used to defer the loading of off-screen images.
-   **Image Optimization (WebP):** Images stored in **Supabase Storage** will be requested in the **WebP** format using Supabase's image transformation API. This will significantly reduce file sizes.
-   **Progressive Blur:** To provide a better user experience during image loading, we will implement a progressive blur effect. The Next.js `Image` component's `placeholder="blur"` and `blurDataURL` props will be used. The `blurDataURL` will be a small, base64-encoded version of the low-quality image placeholder.

## 5. 360° Photo Integration

-   **Detection:** The image data object will include a boolean flag, `is360`, to identify 360° photos.
-   **Rendering:** When a 360° image is the `currentIndex`, the `ImageGallery` will conditionally render the `ThreeSixtyViewer` component instead of the `ZoomableImage`. We will use **Pannellum** for this purpose, as it is a lightweight and dependency-free 360° photo viewer.

## 6. Directory Structure

The new components will be organized within the `components/ui` directory as follows:

```
components/
└── ui/
    └── image-gallery/
        ├── index.ts
        ├── ImageGallery.tsx
        ├── Carousel.tsx
        ├── ZoomableImage.tsx
        ├── ThumbnailStrip.tsx
        ├── Lightbox.tsx
        ├── ImageCounter.tsx
        ├── ShareButton.tsx
        ├── DownloadButton.tsx
        ├── LoadingSkeleton.tsx
        ├── GestureHint.tsx
        ├── ThreeSixtyViewer.tsx
        └── hooks/
            └── useGalleryStore.ts