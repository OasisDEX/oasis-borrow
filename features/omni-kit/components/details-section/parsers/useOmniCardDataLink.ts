import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'

interface OmniCardDataLinkParams {
  icon?: string
  label: string
  translationCardName: string
  url: string
}

export function useOmniCardDataLink({
  icon,
  label,
  translationCardName,
  url,
}: OmniCardDataLinkParams): OmniContentCardBase & OmniContentCardExtra {
  return {
    link: {
      fullCard: true,
      label,
      url,
    },
    title: { key: `omni-kit.content-card.${translationCardName}.title` },
    value: label,
    iconImage: icon,
  }
}
