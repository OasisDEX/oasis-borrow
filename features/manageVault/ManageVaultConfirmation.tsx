import { Divider } from '@theme-ui/components'
import { TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import { ManageVaultState } from './manageVault'
import { ManageVaultChangesInformation } from './ManageVaultChangesInformation'

export function ManageVaultConfirmation(props: ManageVaultState) {
  const [vaultChange, setVaultChanges] = useState<ManageVaultState>(props)
  useEffect(() => {
    if (props.stage !== 'manageSuccess') {
      setVaultChanges(props)
    }
  }, [props.stage])
  return props.stage === 'manageInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <ManageVaultChangesInformation {...vaultChange} />
    </>
  )
}

export function ManageVaultConfirmationStatus({
  stage,
  etherscan,
  manageTxHash,
}: ManageVaultState) {
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
