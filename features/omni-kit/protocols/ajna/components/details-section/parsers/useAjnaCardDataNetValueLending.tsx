import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ajnaExtensionTheme } from 'theme'
import { Text } from 'theme-ui'

export function useAjnaCardDataNetValueLending(
  netValuePnlData?: OmniNetValuePnlDataReturnType,
): OmniContentCardExtra | undefined {
  const { t } = useTranslation()
  return netValuePnlData
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
        modal: <OmniMultiplyNetValueModal {...netValuePnlData} theme={ajnaExtensionTheme} />,
      }
    : undefined
}
