export interface MarketingLayoutIconPalette {
  backgroundGradient: string[]
  foregroundGradient: string[]
  symbolGradient: string[]
}

export interface MarketingLayoutPalette {
  mainGradient: string[]
  icon: MarketingLayoutIconPalette
}

export interface MarketingLayoutPageProps {
  palette: MarketingLayoutPalette
}
