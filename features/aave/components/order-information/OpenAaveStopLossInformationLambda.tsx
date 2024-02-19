import BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { DimmedList } from 'components/DImmedList'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import type { getAaveLikeStopLossParams } from 'features/aave/open/helpers'
import type { IStrategyInfo } from 'features/aave/types'
import { getCollateralDuringLiquidation } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex } from 'theme-ui'

interface OpenAaveStopLossInformationLambdaProps {
  collateralActive: boolean
  strategyInfo: IStrategyInfo
  tokensPriceData?: Tickers
  stopLossParams: ReturnType<typeof getAaveLikeStopLossParams.open>
}

export function OpenAaveStopLossInformationLambda({
  collateralActive,
  strategyInfo,
  tokensPriceData,
  stopLossParams,
}: OpenAaveStopLossInformationLambdaProps) {
  const { t } = useTranslation()
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

  const closeVaultGasEstimation = new BigNumber(1300000) // average based on historical data from blockchain
  const closeVaultGasPrice = new BigNumber(50) // gwei
  const estimatedFeesWhenSlTriggered = formatFiatBalance(
    closeVaultGasEstimation
      .multipliedBy(closeVaultGasPrice)
      .multipliedBy(tokensPriceData && tokensPriceData['ETH'] ? tokensPriceData['ETH'] : one)
      .dividedBy(new BigNumber(10).pow(9)),
  )

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
        value={<Flex>${estimatedFeesWhenSlTriggered}</Flex>}
        tooltip={<Box>{t('protection.sl-triggered-gas-estimation')}</Box>}
      />
    </DimmedList>
  )
}
