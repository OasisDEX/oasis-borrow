import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface StopLossCompleteInformationProps {
  executionPrice: BigNumber
  afterStopLossRatio: BigNumber
  isCollateralActive: boolean
  txState?: TxStatus
  txCost: BigNumber
}

export function StopLossCompleteInformation({
  afterStopLossRatio,
  isCollateralActive,
  txCost,
  executionPrice,
}: StopLossCompleteInformationProps) {
  const { t } = useTranslation()
  const {
    positionData: { token, debt, lockedCollateral, liquidationPrice, liquidationRatio },
  } = useAutomationContext()

  const dynamicStopLossPrice = liquidationPrice
    .div(liquidationRatio)
    .times(afterStopLossRatio.div(100))

  const maxToken = lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(debt)
    .div(dynamicStopLossPrice)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(maxToken, token)} ${token}`
    : `${formatAmount(maxToken.multipliedBy(executionPrice), 'USD')} DAI`

  return (
    <VaultChangesInformationContainer title={t('protection.summary-of-protection')}>
      <VaultChangesInformationItem
        label={`${t('protection.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(afterStopLossRatio, {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.dynamic-stop-loss')}`}
        value={<Flex>${formatAmount(dynamicStopLossPrice, 'USD')}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.token-on-stop-loss-trigger', {
          token: isCollateralActive ? token : 'DAI',
        })}`}
        value={<Flex>{maxTokenOrDai}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(txCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}
