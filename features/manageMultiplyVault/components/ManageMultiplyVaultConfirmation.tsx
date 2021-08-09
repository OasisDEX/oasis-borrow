import { Divider } from '@theme-ui/components'
import { TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'

export function ManageMultiplyVaultConfirmation(props: ManageMultiplyVaultState) {
  return props.stage === 'manageInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <ManageMultiplyVaultChangesInformation {...props} />
    </>
  )
}

export function ManageMultiplyVaultConfirmationStatus({
  stage,
  etherscan,
  manageTxHash,
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()

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
