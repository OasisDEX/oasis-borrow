import type { AjnaCumulativesData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataNetValueLendingParams {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: AjnaCumulativesData
  netValue: BigNumber
  pnl?: BigNumber
  pnlUSD?: BigNumber
}

export function useAjnaCardDataNetValueLending({
  collateralPrice,
  collateralToken,
  cumulatives,
  netValue,
  pnl,
}: AjnaCardDataNetValueLendingParams): OmniContentCardExtra {
  const { t } = useTranslation()
  return {
    extra: (
      <>
        {pnl &&
          `${t('omni-kit.content-card.net-value.footnote')} ${pnl.gte(zero) ? '+' : ''}
      ${formatDecimalAsPercent(pnl)}`}
      </>
    ),
    modal: (
      <OmniMultiplyNetValueModal
        netValueTokenPrice={collateralPrice}
        netValueToken={collateralToken}
        cumulatives={{
          cumulativeDepositUSD: cumulatives.borrowCumulativeDepositUSD,
          cumulativeWithdrawUSD: cumulatives.borrowCumulativeWithdrawUSD,
          cumulativeFeesUSD: cumulatives.borrowCumulativeFeesUSD,
          cumulativeWithdrawInCollateralToken: cumulatives.borrowCumulativeCollateralWithdraw,
          cumulativeDepositInCollateralToken: cumulatives.borrowCumulativeCollateralDeposit,
          cumulativeFeesInCollateralToken: cumulatives.borrowCumulativeFeesInCollateralToken,
          cumulativeWithdrawInQuoteToken: cumulatives.borrowCumulativeWithdrawInQuoteToken,
          cumulativeDepositInQuoteToken: cumulatives.borrowCumulativeDepositInQuoteToken,
          cumulativeFeesInQuoteToken: cumulatives.borrowCumulativeFeesInQuoteToken,
        }}
        netValueUSD={netValue}
        pnl={pnl}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
