import { ListWithIcon } from 'components/ListWithIcon'
import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { CommonVaultState } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Image } from 'theme-ui'

import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

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
}: {
  stage: OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
}) {
  const { t } = useTranslation()

  return (
    <>
      {stage === 'proxySuccess' ? (
        <Image
          src="/static/img/proxy_complete.gif"
          sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
        />
      ) : (
        <ListWithIcon items={t<string, string[]>('proxy-advantages', { returnObjects: true })} />
      )}
    </>
  )
}
