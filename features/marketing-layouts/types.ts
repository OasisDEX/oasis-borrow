import type { LendingProtocol } from 'lendingProtocols'

export interface MarketingTemplateIconPalette {
  backgroundGradient: string[]
  foregroundGradient: string[]
  symbolGradient: string[]
}

export interface MarketingTemplatePalette {
  mainGradient: string[]
  icon: MarketingTemplateIconPalette
}

export interface MarketingTemplateHeroProps {
  description: string
  image: string
  link: {
    url: string
    label: string
  }
  protocol: LendingProtocol
  title: string
}

export interface MarketingTemplatePageProps {
  hero: MarketingTemplateHeroProps
  palette: MarketingTemplatePalette
}
