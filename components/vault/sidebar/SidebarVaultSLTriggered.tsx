import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { StopLossSummaryInformation } from 'features/automation/protection/controls/StopLossTriggeredFormLayout'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import {
  CloseVaultExitCollateralMultipleEvent,
  CloseVaultExitDaiMultipleEvent,
} from 'features/vaultHistory/vaultHistoryEvents'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarVaultSLTriggeredProps {
  closeEvent: VaultHistoryEvent
}

export function SidebarVaultSLTriggered({ closeEvent }: SidebarVaultSLTriggeredProps) {
  const { t } = useTranslation()

  const {
    beforeCollateralizationRatio,
    beforeDebt,
    ethPrice,
    exitDai,
    gasFee,
    marketPrice,
    oraclePrice,
    sold,
    timestamp,
    token,
    totalFee,
  } = closeEvent as CloseVaultExitDaiMultipleEvent | CloseVaultExitCollateralMultipleEvent

  const offerPrice = oraclePrice.isZero() ? marketPrice : oraclePrice
  const isToCollateral = closeEvent.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const priceImpact = calculatePriceImpact(marketPrice, offerPrice)
  const withdrawAmount = isToCollateral ? closeEvent.exitCollateral : exitDai
  const fee = BigNumber.sum(totalFee, amountFromWei(gasFee, 'ETH').times(ethPrice))

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.your-stop-loss-triggered-desc')}
      </Text>
      <StopLossSummaryInformation
        token={token}
        date={timestamp}
        isToCollateral={isToCollateral}
        tokenPrice={marketPrice}
        priceImpact={priceImpact}
        paybackAmount={beforeDebt}
        withdrawAmount={withdrawAmount}
        tokensSold={sold}
        totalFee={fee}
        collRatio={beforeCollateralizationRatio}
        slippage={new BigNumber(2)} // TODO missing info in cache
      />
    </>
  )
}
