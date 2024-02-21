import { DimmedList } from 'components/DImmedList'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { useGasEstimation } from 'features/aave/hooks/useGasEstimation'
import { useTransactionCostWithLoading } from 'features/aave/hooks/useTransactionCostWithLoading'
import type { getAaveLikeStopLossParams } from 'features/aave/open/helpers'
import type { IStrategyInfo } from 'features/aave/types'
import { getCollateralDuringLiquidation } from 'features/automation/protection/stopLoss/helpers'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { formatAmount } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'theme-ui'

interface OpenAaveStopLossInformationLambdaProps {
  collateralActive: boolean
  strategyInfo: IStrategyInfo
  stopLossParams: ReturnType<typeof getAaveLikeStopLossParams.open>
}

export function OpenAaveStopLossInformationLambda({
  collateralActive,
  strategyInfo,
  stopLossParams,
}: OpenAaveStopLossInformationLambdaProps) {
  const { t } = useTranslation()
  const { signer } = useWalletManagement()
  const gasEstimation = useGasEstimation({
    transaction: stopLossParams.stopLossTxData,
    networkId: stopLossParams.strategy.networkId,
    signer,
  })
  const TransactionCost = useTransactionCostWithLoading({ transactionCost: gasEstimation })
  const collateralToken = strategyInfo.tokens.collateral
  const debtToken = strategyInfo.tokens.debt
  const lockedCollateral = stopLossParams.lockedCollateral
  const debt = stopLossParams.debt

  const afterMaxToken = stopLossParams.dynamicStopLossPrice.isZero()
    ? zero
    : lockedCollateral
        .times(stopLossParams.dynamicStopLossPrice)
        .minus(debt)
        .div(stopLossParams.dynamicStopLossPrice)

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice: stopLossParams.liquidationPrice.eq(zero)
      ? one
      : stopLossParams.liquidationPrice,
    liquidationPenalty: strategyInfo.liquidationBonus,
  })

  const savingCompareToLiquidation = afterMaxToken.minus(collateralDuringLiquidation)

  const maxTokenOrDebtToken = collateralActive
    ? `${formatAmount(afterMaxToken, collateralToken)} ${collateralToken}`
    : `${formatAmount(
        afterMaxToken.multipliedBy(stopLossParams.dynamicStopLossPrice),
        debtToken,
      )} ${debtToken}`

  const savingTokenOrDebtToken = collateralActive
    ? `${formatAmount(savingCompareToLiquidation, collateralToken)} ${collateralToken}`
    : `${formatAmount(
        savingCompareToLiquidation.multipliedBy(stopLossParams.dynamicStopLossPrice),
        debtToken,
      )} ${debtToken}`

  return (
    <DimmedList>
      <VaultChangesInformationItem
        label={`${t('protection.estimated-to-receive')}`}
        value={
          <Flex>
            {t('protection.up-to')} {maxTokenOrDebtToken}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.saving-comp-to-liquidation')}`}
        value={
          <Flex>
            {t('protection.up-to')} {savingTokenOrDebtToken}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.estimated-fees-on-trigger', { token: collateralToken })}`}
        value={TransactionCost}
      />
    </DimmedList>
  )
}
