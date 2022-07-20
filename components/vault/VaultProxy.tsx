import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { WithArrow } from 'components/WithArrow'
import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { CommonVaultState } from 'helpers/types'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Image, Text } from 'theme-ui'

import { HasGasEstimation } from '../../helpers/form'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'
import { getEstimatedGasFeeText, VaultChangesInformationItem } from './VaultChangesInformation'

export function VaultProxyStatusCard({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
}: CommonVaultState) {
  const { t } = useTranslation()

  return (
    <>
      {stage === 'proxyInProgress' && (
        <TxStatusCardProgress
          etherscan={etherscan!}
          text={t('proxy-deployment-confirming', {
            proxyConfirmations: proxyConfirmations || 0,
            safeConfirmations,
          })}
          txHash={proxyTxHash!}
        />
      )}
      {stage === 'proxySuccess' && (
        <TxStatusCardSuccess
          text={t('proxy-deployment-confirming', {
            proxyConfirmations: safeConfirmations,
            safeConfirmations,
          })}
          etherscan={etherscan!}
          txHash={proxyTxHash!}
        />
      )}
    </>
  )
}

export function VaultProxyContentBox({
  stage,
  gasData,
}: {
  stage: OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
  gasData: HasGasEstimation
}) {
  const { t } = useTranslation()

  return (
    <>
      {stage === 'proxySuccess' ? (
        <Image
          src={staticFilesRuntimeUrl('/static/img/proxy_complete.gif')}
          sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
        />
      ) : (
        <>
          <ListWithIcon items={t<string, string[]>('proxy-advantages', { returnObjects: true })} />
          {stage !== 'proxyInProgress' && (
            <Box>
              <Text as="p" sx={{ fontSize: 2, fontWeight: 'semiBold', mb: 3 }}>
                {t('creating-proxy-contract')}
              </Text>
              <VaultChangesInformationItem
                label={t('transaction-fee')}
                value={getEstimatedGasFeeText(gasData)}
              />
            </Box>
          )}
        </>
      )}
    </>
  )
}

export function VaultProxySubtitle({
  stage,
}: {
  stage: OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
}) {
  return (
    <Trans
      i18nKey={
        stage === 'proxySuccess' ? 'vault-form.subtext.proxy-success' : 'vault-form.subtext.proxy'
      }
      components={{
        1: (
          <AppLink href="https://kb.oasis.app/help/what-is-a-proxy-contract" sx={{ fontSize: 2 }} />
        ),
        2: <WithArrow sx={{ display: 'inline', color: 'interactive100', fontWeight: 'body' }} />,
      }}
    />
  )
}
