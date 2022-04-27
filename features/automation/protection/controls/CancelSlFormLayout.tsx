import { TxStatus } from '@oasisdex/transactions'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { MessageCard } from 'components/MessageCard'
import { HasGasEstimation } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'

import { RetryableLoadingButtonProps } from '../../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../../components/dumb/TxStatusSection'
import { AppLink } from '../../../../components/Links'
import {
  getEstimatedGasFeeText,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../components/vault/VaultChangesInformation'
import { VaultChangesWithADelayCard } from '../../../../components/vault/VaultChangesWithADelayCard'
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { OpenVaultAnimation } from '../../../../theme/animations'
import { AutomationFormButtons } from '../common/components/AutomationFormButtons'
import { AutomationFormHeader } from '../common/components/AutomationFormHeader'
import { progressStatuses } from '../common/consts/txStatues'

interface CancelDownsideProtectionInformationProps {
  gasEstimationText: ReactNode
  liquidationPrice: BigNumber
}

function CancelDownsideProtectionInformation({
  gasEstimationText,
  liquidationPrice,
}: CancelDownsideProtectionInformationProps) {
  const { t } = useTranslation()

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
    </VaultChangesInformationContainer>
  )
}

interface CancelCompleteInformationProps {
  liquidationPrice: BigNumber
  tokenPrice: BigNumber
  txState?: TxStatus
  totalCost: BigNumber
}

function CancelCompleteInformation({
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
  actualCancelTxCost?: BigNumber
  txState?: TxStatus
  txHash?: string
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
                <AppLink href="https://kb.oasis.app/help" sx={{ fontWeight: 'body' }}>
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
        />
      )}
    </Grid>
  )
}
