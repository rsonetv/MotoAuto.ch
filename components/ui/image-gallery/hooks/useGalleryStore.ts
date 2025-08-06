import { create, type StateCreator } from 'zustand';

interface Image {
  src: string;
  alt: string;
  thumbnail: string;
  is360: boolean;
}

interface GalleryState {
  images: Image[];
  currentIndex: number;
  isLightboxOpen: boolean;
  zoomLevel: number;
  isZoomed: boolean;
  setImages: (images: Image[]) => void;
  setCurrentIndex: (index: number) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setZoomLevel: (level: number) => void;
}

const store: StateCreator<GalleryState> = (set) => ({
  images: [],
  currentIndex: 0,
  isLightboxOpen: false,
  zoomLevel: 1,
  isZoomed: false,
  setImages: (images: Image[]) => set({ images }),
  setCurrentIndex: (index: number) => set({ currentIndex: index }),
  openLightbox: (index: number) => set({ isLightboxOpen: true, currentIndex: index }),
  closeLightbox: () => set({ isLightboxOpen: false }),
  setZoomLevel: (level: number) => set((state) => ({ zoomLevel: level, isZoomed: level > 1 })),
});

export const useGalleryStore = create<GalleryState>(store);