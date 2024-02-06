import { Box } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import type { IStrategyInfo } from 'features/aave/types'
import { getCollateralDuringLiquidation } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface StopLossCommonOrderInformationLambdaProps {
  afterMaxToken: BigNumber
  isCollateralActive: boolean
  executionPrice: BigNumber
  lockedCollateral: BigNumber
  debt: BigNumber
  liquidationPrice: BigNumber
  strategyInfo?: IStrategyInfo
  tokensPriceData?: Tickers
}

export function StopLossCommonOrderInformationLambda({
  afterMaxToken,
  isCollateralActive,
  executionPrice,
  lockedCollateral,
  debt,
  liquidationPrice,
  strategyInfo,
  tokensPriceData,
}: StopLossCommonOrderInformationLambdaProps) {
  const { t } = useTranslation()
  const token = strategyInfo!.tokens.collateral
  const debtToken = strategyInfo!.tokens.debt
  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty: strategyInfo!.liquidationBonus,
  })

  const savingCompareToLiquidation = afterMaxToken.minus(collateralDuringLiquidation)

  const maxTokenOrDebtToken = isCollateralActive
    ? `${formatAmount(afterMaxToken, token)} ${token}`
    : `${formatAmount(afterMaxToken.multipliedBy(executionPrice), 'USD')} ${debtToken}`

  const savingTokenOrDebtToken = isCollateralActive
    ? `${formatAmount(savingCompareToLiquidation, token)} ${token}`
    : `${formatAmount(savingCompareToLiquidation.multipliedBy(executionPrice), 'USD')} ${debtToken}`

  const closeVaultGasEstimation = new BigNumber(1300000) // average based on historical data from blockchain
  const closeVaultGasPrice = new BigNumber(50) // gwei
  const estimatedFeesWhenSlTriggered = formatFiatBalance(
    closeVaultGasEstimation
      .multipliedBy(closeVaultGasPrice)
      .multipliedBy(tokensPriceData ? tokensPriceData['ETH'] : one)
      .dividedBy(new BigNumber(10).pow(9)),
  )

  return (
    <>
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
        label={`${t('protection.estimated-fees-on-trigger', { token })}`}
        value={<Flex>${estimatedFeesWhenSlTriggered}</Flex>}
        tooltip={<Box>{t('protection.sl-triggered-gas-estimation')}</Box>}
      />
    </>
  )
}
