import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import type { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault.types'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import type { OpenMultiplyVaultStatusProps } from './OpenMultiplyVaultConfirmation.types'

export function OpenMultiplyVaultConfirmation({
  stage,
  children,
}: {
  stage: OpenMultiplyVaultStage
  children: ReactNode
}) {
  return stage === 'txInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      {children}
    </>
  )
}

export function OpenMultiplyVaultStatus({
  stage,
  id,
  etherscan,
  openTxHash,
}: OpenMultiplyVaultStatusProps) {
  const { t } = useTranslation()

  if (stage === 'txInProgress') {
    return (
      <TxStatusCardProgress
        text={t('creating-your-vault-multiply')}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }

  if (stage === 'txSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('vault-created', { id: id?.toString() })}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }
  return null
}
