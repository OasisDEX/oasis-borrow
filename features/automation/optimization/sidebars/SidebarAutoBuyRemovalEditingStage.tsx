import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { BuyInfoSection } from 'features/automation/basicBuySell/InfoSections/BuyInfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { PriceInfo } from 'features/shared/priceInfo'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import React, { ReactNode, useMemo } from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyRemovalEditingStageProps {
  vault: Vault
  priceInfo: PriceInfo
  basicBuyState: BasicBSFormChange
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  cancelTriggerGasEstimation: ReactNode
}

export function SidebarAutoBuyRemovalEditingStage({
  vault,
  priceInfo,
  basicBuyState,
  ilkData,
  errors,
  warnings,
  cancelTriggerGasEstimation,
}: SidebarAutoBuyRemovalEditingStageProps) {
  // TODO dummy changes information for now
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoBuyInfoSectionControl
        priceInfo={priceInfo}
        basicBuyState={basicBuyState}
        vault={vault}
        cancelTriggerGasEstimation={cancelTriggerGasEstimation}
      />
    </>
  )
}

interface AutoSellInfoSectionControlProps {
  priceInfo: PriceInfo
  vault: Vault
  basicBuyState: BasicBSFormChange
  cancelTriggerGasEstimation: ReactNode
}

function AutoBuyInfoSectionControl({
  priceInfo,
  vault,
  basicBuyState,
  cancelTriggerGasEstimation,
}: AutoSellInfoSectionControlProps) {
  const { tokenPriceUSD$ } = useAppContext()
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$([vault.token]), [vault.token])

  const [tokenPriceData] = useObservable(_tokenPriceUSD$)
  const marketPrice = tokenPriceData?.[vault.token] || priceInfo.currentCollateralPrice

  const { debtDelta, collateralDelta } = getVaultChange({
    currentCollateralPrice: priceInfo.currentCollateralPrice,
    marketPrice: marketPrice,
    slippage: basicBuyState.deviation.div(100),
    debt: vault.debt,
    lockedCollateral: vault.lockedCollateral,
    requiredCollRatio: basicBuyState.targetCollRatio.div(100),
    depositAmount: zero,
    paybackAmount: zero,
    generateAmount: zero,
    withdrawAmount: zero,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  return (
    <BuyInfoSection
      colRatioAfterBuy={basicBuyState.targetCollRatio}
      multipleAfterBuy={one.div(basicBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicBuyState.execCollRatio}
      nextBuyPrice={priceInfo.nextCollateralPrice}
      slippageLimit={basicBuyState.deviation}
      collateralAfterNextBuy={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.minus(collateralDelta),
      }}
      outstandingDebtAfterNextBuy={{
        value: vault.debt,
        secondaryValue: vault.debt.minus(debtDelta.abs()),
      }}
      collateralToBePurchased={collateralDelta}
      estimatedTransactionCost={cancelTriggerGasEstimation}
      token={vault.token}
    />
  )
}
