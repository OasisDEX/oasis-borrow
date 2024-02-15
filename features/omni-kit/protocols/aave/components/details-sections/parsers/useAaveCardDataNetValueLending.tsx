import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export const useAaveCardDataNetValueLending = (netValuePnlData: OmniNetValuePnlDataReturnType) => {
  const { t } = useTranslation()
  return netValuePnlData.pnl
    ? {
        extra: (
          <Text as="p" variant="paragraph4">
            {netValuePnlData.pnl?.percentage &&
              `${t('omni-kit.content-card.net-value.footnote')} ${
                netValuePnlData.pnl.percentage.gte(zero) ? '+' : ''
              }
      ${formatDecimalAsPercent(netValuePnlData.pnl.percentage)}`}
          </Text>
        ),
        modal: <OmniMultiplyNetValueModal {...netValuePnlData} />,
      }
    : undefined
}
