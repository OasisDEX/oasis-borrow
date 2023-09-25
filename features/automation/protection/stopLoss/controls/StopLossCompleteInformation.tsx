import type { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
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
    positionData: { token, debtToken },
    metadata: {
      stopLossMetadata: {
        methods: { getMaxToken, getExecutionPrice },
        translations: { ratioParamTranslationKey },
      },
    },
  } = useAutomationContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const afterDynamicStopLossPrice = getExecutionPrice(stopLossState)
  const maxToken = getMaxToken(stopLossState)

  const maxTokenOrDebtToken = isCollateralActive
    ? `${formatAmount(maxToken, token)} ${token}`
    : `${formatAmount(maxToken.multipliedBy(executionPrice), 'USD')} ${debtToken}`

  return (
    <VaultChangesInformationContainer title={t('protection.summary-of-protection')}>
      <VaultChangesInformationItem
        label={`${t('system.stop-loss')} ${t(ratioParamTranslationKey)}`}
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
          token: isCollateralActive ? token : debtToken,
        })}`}
        value={<Flex>{maxTokenOrDebtToken}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(txCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}
