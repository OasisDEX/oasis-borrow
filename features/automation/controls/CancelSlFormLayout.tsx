import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { AutomationBotRemoveTriggerData } from 'blockchain/calls/automationBot'
import { MessageCard } from 'components/MessageCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'

import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/dumb/TxStatusSection'
import { AppLink } from '../../../components/Links'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../components/vault/VaultChangesInformation'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import { zero } from '../../../helpers/zero'
import { OpenVaultAnimation } from '../../../theme/animations'
import { AutomationFormButtons } from '../common/components/AutomationFormButtons'
import { AutomationFormHeader } from '../common/components/AutomationFormHeader'

interface CancelDownsideProtectionInformationProps {
  gasEstimation: ReactNode
  liquidationPrice: BigNumber
}

function CancelDownsideProtectionInformation({
  gasEstimation,
  liquidationPrice,
}: CancelDownsideProtectionInformationProps) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.liquidation')}`}
        value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
      />
      <VaultChangesInformationItem label={`${t('protection.max-cost')}`} value={gasEstimation} />
    </VaultChangesInformationContainer>
  )
}

interface CancelCompleteInformationProps {
  liquidationPrice: BigNumber
  tokenPrice: BigNumber
  txState?: TxState<AutomationBotRemoveTriggerData>
}

function CancelCompleteInformation({
  liquidationPrice,
  txState,
  tokenPrice,
}: CancelCompleteInformationProps) {
  const { t } = useTranslation()
  const successTx = txState?.status === TxStatus.Success
  const gasUsed = successTx ? new BigNumber(txState.receipt.gasUsed) : zero
  const effectiveGasPrice = successTx ? new BigNumber(txState.receipt.effectiveGasPrice) : zero
  const totalCost =
    !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(tokenPrice)
      : zero

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
  gasEstimation: ReactNode
  accountIsController: boolean
  txProgressing: boolean
  txSuccess: boolean
  etherscan: string
  txState?: TxState<AutomationBotRemoveTriggerData>
}

export function CancelSlFormLayout(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        txProgressing={props.txProgressing}
        txSuccess={props.txSuccess}
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
      {!props.txProgressing && !props.txSuccess && (
        <Box my={3}>
          <CancelDownsideProtectionInformation
            gasEstimation={props.gasEstimation}
            liquidationPrice={props.liquidationPrice}
          />
        </Box>
      )}
      {props.txProgressing && <OpenVaultAnimation />}
      {!props.txProgressing && !props.txSuccess && (
        <MessageCard
          messages={[
            <>
              <strong>{t(`notice`)}</strong>: {t('protection.cancel-notice')}
            </>,
          ]}
          type="warning"
          withBullet={false}
        />
      )}
      {props.txSuccess && (
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/cancellation_complete.svg')} />
          </Flex>
          <Divider variant="styles.hrVaultFormBottom" mb={4} />
          <CancelCompleteInformation
            txState={props.txState}
            tokenPrice={props.tokenPrice}
            liquidationPrice={props.liquidationPrice}
          />
        </Box>
      )}
      <Box>
        <TxStatusSection txState={props.txState} etherscan={props.etherscan} />
      </Box>
      {props.accountIsController && !props.txProgressing && (
        <AutomationFormButtons
          triggerConfig={props.removeTriggerConfig}
          toggleForms={props.toggleForms}
          toggleKey={
            props.txSuccess ? 'protection.set-stop-loss-again' : 'protection.navigate-adjust'
          }
          txSuccess={props.txSuccess}
          type="cancel"
        />
      )}
    </Grid>
  )
}
