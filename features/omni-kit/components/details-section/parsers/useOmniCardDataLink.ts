import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'

interface useOmniCardDataLinkParams {
  label: string
  translationCardName: string
  url: string
}

export function useOmniCardDataLink({
  label,
  translationCardName,
  // url,
}: useOmniCardDataLinkParams): OmniContentCardBase {
  // TODO add full card link when `modalAsTooltip` is removed by @Marcin 
  return {
    title: { key: `omni-kit.content-card.${translationCardName}.title` },
    value: label,
  }
}
