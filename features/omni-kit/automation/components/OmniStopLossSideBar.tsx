import { ActionPills } from 'components/ActionPills'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo } from 'react'

interface OmniStopLossOverviewDetailsSectionProps {
  active?: boolean
}

export const OmniStopLossSideBar: FC<OmniStopLossOverviewDetailsSectionProps> = () => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat, settings },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state, updateState },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const defaultCloseToToken = useMemo(() => {
    if (automation?.triggers.stopLoss?.decodedParams.triggerType) {
      return ''
    }
    return settings.automationDefaultValues?.resolveTo || ''
  }, [
    automation?.triggers.stopLoss?.decodedParams.triggerType,
    settings.automationDefaultValues?.resolveTo,
  ])

  const setupStopLossSidebarContent = (
    <ActionPills
      items={[
        {
          id: 'quote',
          label: t('close-to', { token: quoteToken }),
          action: () => updateState('resolveTo', 'quote'),
        },
        {
          id: 'collateral',
          label: t('close-to', { token: collateralToken }),
          action: () => updateState('resolveTo', 'collateral'),
        },
      ]}
      active={state.resolveTo || defaultCloseToToken}
    />
  )

  return setupStopLossSidebarContent
}
