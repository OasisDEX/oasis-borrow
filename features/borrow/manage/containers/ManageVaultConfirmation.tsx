import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { ManageBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import { ManageVaultChangesInformation } from './ManageVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'

export function ManageVaultConfirmation(
  props: ManageMultiplyVaultState & { txnCostDisplay?: ReactNode },
) {
  const [vaultChange, setVaultChanges] = useState<ManageBorrowVaultState>(props)
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
}: ManageBorrowVaultState) {
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
