import { create } from "zustand";

export type PreviewZoom = "fit" | number;

interface PreviewZoomStore {
  zoom: PreviewZoom;
  setZoom: (zoom: PreviewZoom) => void;
}

export const usePreviewZoomStore = create<PreviewZoomStore>((set) => ({
  zoom: "fit",
  setZoom: (zoom) => set({ zoom }),
}));
