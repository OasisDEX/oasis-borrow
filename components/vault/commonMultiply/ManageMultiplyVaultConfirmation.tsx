import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'

import { ManageMultiplyVaultState } from '../../../features/multiply/manage/pipes/manageMultiplyVault'

export function ManageMultiplyVaultConfirmation(
  props: ManageMultiplyVaultState & { children: (props: ManageMultiplyVaultState) => ReactNode },
) {
  const [vaultChange, setVaultChanges] = useState<ManageMultiplyVaultState>(props)
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
      {props.children(vaultChange)}
    </>
  )
}

export function ManageMultiplyVaultConfirmationStatus({
  stage,
  etherscan,
  manageTxHash,
  originalEditingStage,
  otherAction,
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  if (stage === 'manageInProgress') {
    const messageKey =
      originalEditingStage === 'adjustPosition'
        ? 'adjusting-vault-multiply'
        : otherAction === 'closeVault'
        ? 'closing-vault-multiply'
        : 'changing-vault-multiply'

    return (
      <TxStatusCardProgress text={t(messageKey)} etherscan={etherscan!} txHash={manageTxHash!} />
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
