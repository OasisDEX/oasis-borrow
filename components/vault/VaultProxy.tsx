import { CommonVaultState } from 'helpers/types'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

type VaultProxyStatusCardProps = {
  stage: CommonVaultState['stage']
  proxyConfirmations?: number
  safeConfirmations: number
  proxyTxHash?: string
  etherscan?: string
}

export function VaultProxyStatusCard({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
}: VaultProxyStatusCardProps) {
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
