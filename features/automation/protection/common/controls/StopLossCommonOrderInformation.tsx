import { Box } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface StopLossCommonOrderInformationProps {
  afterMaxToken: BigNumber
  isCollateralActive: boolean
  executionPrice: BigNumber
}

export function StopLossCommonOrderInformation({
  afterMaxToken,
  isCollateralActive,
  executionPrice,
}: StopLossCommonOrderInformationProps) {
  const { t } = useTranslation()
  const {
    positionData: { token, debtToken },
    metadata: {
      stopLossMetadata: {
        values: { collateralDuringLiquidation },
      },
    },
    environmentData: { ethMarketPrice },
  } = useAutomationContext()

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
      .multipliedBy(ethMarketPrice)
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
