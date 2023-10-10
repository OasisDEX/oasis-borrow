import type BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import type { Vault } from 'blockchain/vaults.types'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { AutoSellInfoSectionControl } from './AutoSellInfoSectionControl'

interface SidebarAutoSellAwaitingConfirmationProps {
  vault: Vault
  autoSellState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
  isAwaitingConfirmation: boolean
}

export function SidebarAutoSellAwaitingConfirmation({
  vault,
  autoSellState,
  debtDelta,
  collateralDelta,
}: SidebarAutoSellAwaitingConfirmationProps) {
  const { t } = useTranslation()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-sell.confirmation')}
      </Text>
      <AutoSellInfoSectionControl
        autoSellState={autoSellState}
        debtDelta={debtDelta}
        collateralDelta={collateralDelta}
        executionPrice={executionPrice}
        maxGasFee={autoSellState.maxBaseFeeInGwei.toNumber()}
      />
    </>
  )
}
