import { TxStatus } from '@oasisdex/transactions'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { TxStatusSection } from 'components/dumb/TxStatusSection'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import {
  getEstimatedGasFeeText,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { HasGasEstimation } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TxError } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from '../../../form/commonValidators'
import { isTxStatusFailed } from '../common/AutomationTransactionPlunger'
import { AutomationFormButtons } from '../common/components/AutomationFormButtons'
import { AutomationFormHeader } from '../common/components/AutomationFormHeader'
import { progressStatuses } from '../common/consts/txStatues'

interface CancelDownsideProtectionInformationProps {
  gasEstimationText: ReactNode
  liquidationPrice: BigNumber
  ethPrice: BigNumber
  ethBalance: BigNumber
  txError?: TxError
  gasEstimationUsd?: BigNumber
}

export function CancelDownsideProtectionInformation({
  gasEstimationText,
  liquidationPrice,
  ethPrice,
  ethBalance,
  txError,
  gasEstimationUsd,
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
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.liquidation')}`}
        value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.max-cost')}`}
        value={gasEstimationText}
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
}

export function CancelCompleteInformation({
  liquidationPrice,
  totalCost,
}: CancelCompleteInformationProps) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.liquidation')}`}
        value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
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
  gasEstimation: HasGasEstimation
  accountIsController: boolean
  etherscan: string
  ethPrice: BigNumber
  ethBalance: BigNumber
  txError?: TxError
  actualCancelTxCost?: BigNumber
  txState?: TxStatus
  txHash?: string
  gasEstimationUsd?: BigNumber
  stage: 'editing' | 'txInProgress' | 'txSuccess' | 'txFailure'
  isProgressDisabled: boolean
  token: string
  ilkData: IlkData
  currentCollateralRatio: BigNumber
  selectedSLValue: BigNumber
}

export function CancelSlFormLayout(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()

  const isTxProgressing = !!props.txState && progressStatuses.includes(props.txState)
  const gasEstimationText = getEstimatedGasFeeText(props.gasEstimation)

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        txProgressing={isTxProgressing}
        txSuccess={props.txState === TxStatus.Success}
        translations={{
          editing: {
            header: t('protection.cancel-downside-protection'),
            description: t('protection.cancel-downside-protection-desc'),
          },
          progressing: {
            header: t('protection.cancelling-downside-protection'),
            description: (
              <>
                <Text variant="paragraph3" sx={{ mb: '24px', color: 'lavender' }}>
                  {t('protection.cancelling-downside-protection-desc')}
                </Text>
                <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'lavender' }}>
                  {t('protection.position-again-at-risk')}
                </Text>
              </>
            ),
          },
          success: {
            header: t('protection.cancel-protection-complete'),
            description: (
              <>
                <Text variant="paragraph3" sx={{ mb: '24px', color: 'lavender' }}>
                  {t('protection.cancel-protection-complete-desc')}
                </Text>
                <AppLink
                  href="https://kb.oasis.app/help/stop-loss-protection"
                  sx={{ fontWeight: 'body' }}
                >
                  {t('protection.find-more-about-setting-stop-loss')}
                </AppLink>
              </>
            ),
          },
        }}
      />
      {props.txState !== TxStatus.Success && !isTxProgressing && (
        <>
          <Box my={3}>
            <CancelDownsideProtectionInformation
              gasEstimationText={gasEstimationText}
              liquidationPrice={props.liquidationPrice}
              ethPrice={props.ethPrice}
              gasEstimationUsd={props.gasEstimationUsd}
              ethBalance={props.ethBalance}
              txError={props.txError}
            />
          </Box>
          <MessageCard
            messages={[
              <>
                <strong>{t(`notice`)}</strong>: {t('protection.cancel-notice')}
              </>,
            ]}
            type="warning"
            withBullet={false}
          />
        </>
      )}
      {isTxProgressing && <OpenVaultAnimation />}
      {props.txState === TxStatus.Success && (
        <>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/cancellation_complete.svg')} />
            </Flex>
            <Divider variant="styles.hrVaultFormBottom" mb={4} />
            <CancelCompleteInformation
              totalCost={props.actualCancelTxCost!}
              tokenPrice={props.tokenPrice}
              liquidationPrice={props.liquidationPrice}
            />
          </Box>
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </>
      )}
      <Box>
        <TxStatusSection
          txStatus={props.txState}
          txHash={props.txHash}
          etherscan={props.etherscan}
        />
      </Box>
      {props.accountIsController && !isTxProgressing && (
        <AutomationFormButtons
          triggerConfig={props.removeTriggerConfig}
          toggleForms={props.toggleForms}
          toggleKey={
            (props.txState as TxStatus) === TxStatus.Success
              ? 'protection.set-stop-loss-again'
              : 'protection.navigate-adjust'
          }
          txSuccess={(props.txState as TxStatus) === TxStatus.Success}
          type="cancel"
          txError={props.txState && isTxStatusFailed(props.txState)}
        />
      )}
    </Grid>
  )
}
