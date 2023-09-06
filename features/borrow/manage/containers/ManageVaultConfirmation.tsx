import React, { ReactNode, useEffect, useState } from 'react'
import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import { OpenVaultAnimation } from 'theme/animations'

export function ManageVaultConfirmation(
  props: ManageStandardBorrowVaultState & { txnCostDisplay?: ReactNode },
) {
  const [vaultChange, setVaultChanges] = useState<ManageStandardBorrowVaultState>(props)

  useEffect(() => {
    if (props.stage !== 'manageSuccess') {
      setVaultChanges(props)
    }
  }, [props])

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
}: ManageStandardBorrowVaultState) {
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
