import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { notAvailable } from 'handlers/portfolio/constants'
import { useTranslation } from 'next-i18next'
import { question_o } from 'theme/icons'

interface AjnaCardDataBuyingPowerParams {
  shouldShowDynamicLtv: boolean
}

export function useAjnaCardDataBuyingPower({
  shouldShowDynamicLtv,
}: AjnaCardDataBuyingPowerParams): Partial<OmniContentCardBase> & OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    ...(!shouldShowDynamicLtv && {
      value: notAvailable,
      footnote: undefined,
    }),
    icon: question_o,
    iconColor: 'neutral80',
    iconPosition: 'after',
    customValueColor: 'neutral80',
    tooltips: {
      icon: t('ajna.content-card.buying-power.tooltip'),
    },
  }
}
