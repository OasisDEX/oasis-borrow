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
  txState?: TxStatus,
  totalCost: BigNumber
}

function CancelCompleteInformation({
  liquidationPrice,
  totalCost
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
  gasEstimation: ReactNode
  accountIsController: boolean
  etherscan: string
  txState?: TxStatus
}

export function CancelSlFormLayout(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        txProgressing={!!props.txState && props.txState!== TxStatus.Success && props.txState!== TxStatus.Failure }
        txSuccess={props.txState === TxStatus.Success }
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
      {!(props.txState!==TxStatus.Success && props.txState!==TxStatus.Failure) && props.txState!==TxStatus.Success && (
        <Box my={3}>
          <CancelDownsideProtectionInformation
            gasEstimation={props.gasEstimation}
            liquidationPrice={props.liquidationPrice}
          />
        </Box>
      )}
      {props.txState!==TxStatus.Success && props.txState!==TxStatus.Failure && <OpenVaultAnimation />}
      {!(props.txState!==TxStatus.Success && props.txState!==TxStatus.Failure) && props.txState!==TxStatus.Success && (
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
      {props.txState===TxStatus.Success && (
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/cancellation_complete.svg')} />
          </Flex>
          <Divider variant="styles.hrVaultFormBottom" mb={4} />
          <CancelCompleteInformation
            totalCost={new BigNumber(200)}
            tokenPrice={props.tokenPrice}
            liquidationPrice={props.liquidationPrice}
          />
        </Box>
      )}
      <Box>
        <TxStatusSection
          txStatus={props.txState}
          txHash={(props.txState as any)?.txHash}
          etherscan={props.etherscan}
        />
      </Box>
      {props.accountIsController && props.txState!==TxStatus.Success && props.txState!==TxStatus.Failure && (
        <AutomationFormButtons
          triggerConfig={props.removeTriggerConfig}
          toggleForms={props.toggleForms}
          toggleKey={
            props.txState as TxStatus===TxStatus.Success ? 'protection.set-stop-loss-again' : 'protection.navigate-adjust'
          }
          txSuccess={props.txState as TxStatus===TxStatus.Success}
          type="cancel"
        />
      )}
    </Grid>
  )
}
