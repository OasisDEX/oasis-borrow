import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { GasEstimation } from 'components/GasEstimation'
import { MessageCard } from 'components/MessageCard'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { TxError } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from '../../../form/commonValidators'

interface CancelDownsideProtectionInformationProps {
  liquidationPrice: BigNumber
  ethPrice: BigNumber
  ethBalance: BigNumber
  txError?: TxError
  gasEstimationUsd?: BigNumber
  selectedSLValue: BigNumber
}

export function CancelDownsideProtectionInformation({
  liquidationPrice,
  ethPrice,
  ethBalance,
  txError,
  gasEstimationUsd,
  selectedSLValue,
}: CancelDownsideProtectionInformationProps) {
  const { t } = useTranslation()

  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  return (
    <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
      {!liquidationPrice.isZero() && (
        <VaultChangesInformationItem
          label={`${t('cancel-stoploss.liquidation')}`}
          value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
        />
      )}
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(selectedSLValue)}
            <VaultChangesInformationArrow />
            n/a
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.max-cost')}`}
        value={<GasEstimation />}
      />
      {potentialInsufficientEthFundsForTx && (
        <MessageCard
          messages={[t('vault-warnings.insufficient-eth-balance')]}
          type="warning"
          withBullet={false}
        />
      )}
      {insufficientEthFundsForTx && (
        <MessageCard
          messages={[t('vault-errors.insufficient-eth-balance')]}
          type="error"
          withBullet={false}
        />
      )}
    </VaultChangesInformationContainer>
  )
}

interface CancelCompleteInformationProps {
  liquidationPrice: BigNumber
  tokenPrice: BigNumber
  txState?: TxStatus
  totalCost: BigNumber
  selectedSLValue: BigNumber
}

export function CancelCompleteInformation({
  liquidationPrice,
  totalCost,
  selectedSLValue,
}: CancelCompleteInformationProps) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
      {!liquidationPrice.isZero() && (
        <VaultChangesInformationItem
          label={`${t('cancel-stoploss.liquidation')}`}
          value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
        />
      )}
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(selectedSLValue)}
            <VaultChangesInformationArrow />
            n/a
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(totalCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}

export interface CancelSlFormLayoutProps {
  liquidationPrice: BigNumber
  tokenPrice: BigNumber
  removeTriggerConfig: RetryableLoadingButtonProps
  toggleForms: () => void
  accountIsController: boolean
  etherscan: string
  ethPrice: BigNumber
  ethBalance: BigNumber
  txError?: TxError
  actualCancelTxCost?: BigNumber
  txState?: TxStatus
  txHash?: string
  stage: 'editing' | 'txInProgress' | 'txSuccess' | 'txFailure'
  isProgressDisabled: boolean
  token: string
  ilkData: IlkData
  currentCollateralRatio: BigNumber
  selectedSLValue: BigNumber
  vault: Vault
}
