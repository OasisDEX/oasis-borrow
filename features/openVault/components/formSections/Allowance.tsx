import { VaultAllowance } from 'components/vault/VaultAllowance'
import { pick } from 'helpers/pick'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function Allowance() {
  const {
    stage,
    token,
    depositAmount,
    allowanceAmount,
    updateAllowanceAmount,
    setAllowanceAmountUnlimited,
    setAllowanceAmountToDepositAmount,
    setAllowanceAmountCustom,
    selectedAllowanceRadio,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx,
      'stage',
      'token',
      'depositAmount',
      'allowanceAmount',
      'updateAllowanceAmount',
      'setAllowanceAmountUnlimited',
      'setAllowanceAmountToDepositAmount',
      'setAllowanceAmountCustom',
      'selectedAllowanceRadio',
    ),
  }))

  return (
    <VaultAllowance
      stage={stage}
      token={token}
      depositAmount={depositAmount}
      allowanceAmount={allowanceAmount}
      updateAllowanceAmount={updateAllowanceAmount}
      setAllowanceAmountUnlimited={setAllowanceAmountUnlimited}
      setAllowanceAmountToDepositAmount={setAllowanceAmountToDepositAmount}
      setAllowanceAmountCustom={setAllowanceAmountCustom}
      selectedAllowanceRadio={selectedAllowanceRadio}
    />
  )
}
