import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface StopLossCompleteInformationProps {
  executionPrice: BigNumber
  isCollateralActive: boolean
  txState?: TxStatus
  txCost: BigNumber
}

export function StopLossCompleteInformation({
  isCollateralActive,
  txCost,
  executionPrice,
}: StopLossCompleteInformationProps) {
  const { t } = useTranslation()
  const {
    positionData: { token },
    metadata: {
      stopLossMetadata: {
        methods: { getMaxToken, getExecutionPrice },
      },
    },
  } = useAutomationContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const afterDynamicStopLossPrice = getExecutionPrice(stopLossState)
  const maxToken = getMaxToken(stopLossState)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(maxToken, token)} ${token}`
    : `${formatAmount(maxToken.multipliedBy(executionPrice), 'USD')} DAI`

  return (
    <VaultChangesInformationContainer title={t('protection.summary-of-protection')}>
      <VaultChangesInformationItem
        label={`${t('protection.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(stopLossState.stopLossLevel, {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.dynamic-stop-loss')}`}
        value={<Flex>${formatAmount(afterDynamicStopLossPrice, 'USD')}</Flex>}
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
