import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import { ManageVaultChangesInformation } from './ManageVaultChangesInformation'

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
