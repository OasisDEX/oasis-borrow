import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { autoKindToCopyMap } from 'features/automation/common/consts'
import type { AutomationKinds } from 'features/automation/common/types'
import { StopLossSummaryInformation } from 'features/automation/protection/stopLoss/controls/StopLossSummaryInformation'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type {
  AutoTakeProfitExecutedEvent,
  StopLossExecutedEvent,
} from 'features/vaultHistory/vaultHistoryEvents.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutomationVaultCloseTriggeredProps {
  closeEvent: VaultHistoryEvent
}

export function SidebarAutomationVaultCloseTriggered({
  closeEvent,
}: SidebarAutomationVaultCloseTriggeredProps) {
  const { t } = useTranslation()

  if (!('triggerId' in closeEvent)) {
    return null
  }

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
  } = closeEvent as StopLossExecutedEvent | AutoTakeProfitExecutedEvent

  const offerPrice = oraclePrice.isZero() ? marketPrice : oraclePrice
  const isToCollateral = closeEvent.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const priceImpact = calculatePriceImpact(marketPrice, offerPrice)
  const withdrawAmount = isToCollateral ? closeEvent.exitCollateral : exitDai
  const fee = BigNumber.sum(totalFee, amountFromWei(gasFee, 'ETH').times(ethPrice))

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.what-happened-to-the-vault')}
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
        feature={t(autoKindToCopyMap[closeEvent.autoKind as AutomationKinds])}
      />
    </>
  )
}
