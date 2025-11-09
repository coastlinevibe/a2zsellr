export { GalleryMosaicLayout } from './GalleryMosaicLayout'
export { HoverCardsLayout } from './HoverCardsLayout'
export { BeforeAfterLayout } from './BeforeAfterLayout'
export { VideoSpotlightLayout } from './VideoSpotlightLayout'
export { HorizontalSliderLayout } from './HorizontalSliderLayout'
export { VerticalSliderLayout } from './VerticalSliderLayout'

// Layout type definitions
export interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

export interface LayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
}

// Layout component mapping
export const LAYOUT_COMPONENTS = {
  'gallery-mosaic': 'GalleryMosaicLayout',
  'hover-cards': 'HoverCardsLayout', 
  'before-after': 'BeforeAfterLayout',
  'video-spotlight': 'VideoSpotlightLayout',
  'horizontal-slider': 'HorizontalSliderLayout',
  'vertical-slider': 'VerticalSliderLayout'
} as const

export type LayoutType = keyof typeof LAYOUT_COMPONENTS
