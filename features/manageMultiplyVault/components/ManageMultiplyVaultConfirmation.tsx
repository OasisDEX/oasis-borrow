import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'

export function ManageVaultConfirmation(props: ManageMultiplyVaultState) {
  return (
    <>
      <Divider />
      <ManageVaultChangesInformation {...props} />
    </>
  )
}

export function ManageVaultConfirmationStatus({
  stage,
  etherscan,
  manageTxHash,
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  if (stage === 'manageInProgress') {
    return (
      <TxStatusCardProgress
        text={t('changing-vault')}
        etherscan={etherscan!}
        txHash={manageTxHash!}
      />
    )
  }
  if (stage === 'manageSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('vault-changed')}
        etherscan={etherscan!}
        txHash={manageTxHash!}
      />
    )
  }
  return null
}
