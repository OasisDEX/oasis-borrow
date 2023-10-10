import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { WithArrow } from 'components/WithArrow'
import type { OpenVaultStage } from 'features/borrow/open/pipes/openVault.types'
import type { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/ManageMultiplyVaultStage.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { CommonVaultState } from 'helpers/types/CommonVaultState.types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Image, Text } from 'theme-ui'

import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'
import { getEstimatedGasFeeTextOld, VaultChangesInformationItem } from './VaultChangesInformation'

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
  stage: OpenVaultStage | ManageMultiplyVaultStage
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
          <ListWithIcon items={t('proxy-advantages', { returnObjects: true })} />
          {stage !== 'proxyInProgress' && (
            <Box>
              <Text as="p" sx={{ fontSize: 2, fontWeight: 'semiBold', mb: 3 }}>
                {t('creating-proxy-contract')}
              </Text>
              <VaultChangesInformationItem
                label={t('transaction-fee')}
                value={getEstimatedGasFeeTextOld(gasData)}
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
  stage: OpenVaultStage | ManageMultiplyVaultStage
}) {
  return (
    <Trans
      i18nKey={
        stage === 'proxySuccess' ? 'vault-form.subtext.proxy-success' : 'vault-form.subtext.proxy'
      }
      components={{
        1: <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_PROXY} sx={{ fontSize: 2 }} />,
        2: <WithArrow sx={{ display: 'inline', color: 'interactive100', fontWeight: 'body' }} />,
      }}
    />
  )
}
