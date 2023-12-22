import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers/getOmniNetValuePnlData.types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ajnaExtensionTheme } from 'theme'

export function useAjnaCardDataNetValueLending(
  netValuePnlData?: OmniNetValuePnlDataReturnType,
): OmniContentCardExtra | undefined {
  const { t } = useTranslation()
  return netValuePnlData
    ? {
        extra: (
          <>
            {netValuePnlData.pnl?.percentage &&
              `${t('omni-kit.content-card.net-value.footnote')} ${
                netValuePnlData.pnl.percentage.gte(zero) ? '+' : ''
              }
      ${formatDecimalAsPercent(netValuePnlData.pnl.percentage)}`}
          </>
        ),
        modal: <OmniMultiplyNetValueModal {...netValuePnlData} theme={ajnaExtensionTheme} />,
      }
    : undefined
}
