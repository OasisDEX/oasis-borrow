import { Divider } from '@theme-ui/components'
import { BigNumber } from 'bignumber.js'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { OpenVaultAnimation } from 'theme/animations'

import { Stage } from '../../../features/earn/guni/open/pipes/openGuniVault'

export function OpenMultiplyVaultConfirmation({
  stage,
  children,
}: {
  stage: Stage
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
  stage: Stage
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
