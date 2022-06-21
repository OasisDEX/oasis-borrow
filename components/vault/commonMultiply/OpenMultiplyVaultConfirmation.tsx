import { Divider } from '@theme-ui/components'
import { BigNumber } from 'bignumber.js'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { OpenVaultAnimation } from 'theme/animations'

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

export interface OpenMultiplyVaultStatusProps {
  stage: OpenMultiplyVaultStage
  id?: BigNumber
  etherscan?: string
  openTxHash?: string
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
