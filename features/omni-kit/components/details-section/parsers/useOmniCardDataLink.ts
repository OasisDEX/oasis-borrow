import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'

interface OmniCardDataLinkParams {
  label: string
  translationCardName: string
  url: string
}

export function useOmniCardDataLink({
  label,
  translationCardName,
  url,
}: OmniCardDataLinkParams): OmniContentCardBase {
  return {
    link: {
      fullCard: true,
      label,
      url,
    },
    title: { key: `omni-kit.content-card.${translationCardName}.title` },
    value: label,
  }
}
