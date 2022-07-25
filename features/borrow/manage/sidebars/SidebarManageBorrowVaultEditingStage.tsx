import { ActionPills } from 'components/ActionPills'
import {
  extractFieldDepositCollateralData,
  extractFieldGenerateDaiData,
  extractFieldPaybackDaiData,
  extractFieldWithdrawCollateralData,
  FieldDepositCollateral,
  FieldGenerateDai,
  FieldPaybackDai,
  FieldWithdrawCollateral,
} from 'components/vault/sidebar/SidebarFields'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { extractCommonErrors, extractCommonWarnings } from 'helpers/messageMappers'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageBorrowVaultEditingStage(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    accountIsConnected,
    accountIsController,
    depositAmount,
    errorMessages,
    generateAmount,
    inputAmountsEmpty,
    mainAction,
    paybackAmount,
    setMainAction,
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    stage,
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    updateDeposit,
    updateGenerate,
    updatePayback,
    updateWithdraw,
    vault: { debt, token },
    warningMessages,
    withdrawAmount,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  const isOwner = accountIsConnected && accountIsController
  const isCollateralEditing = stage === 'collateralEditing'
  const isDaiEditing = stage === 'daiEditing'
  const isDepositOrGenerate = mainAction === 'depositGenerate'
  const isWithdrawOrPayback = mainAction === 'withdrawPayback'

  useEffect(() => {
    if (inputAmountsEmpty) setIsSecondaryFieldDisabled(true)
    else {
      if (!showDepositAndGenerateOption) toggleDepositAndGenerateOption!()
      if (!showPaybackAndWithdrawOption) togglePaybackAndWithdrawOption!()
      setIsSecondaryFieldDisabled(false)
    }
  }, [depositAmount, withdrawAmount, generateAmount, paybackAmount])

  return (
    <Grid gap={3}>
      <ActionPills
        active={mainAction}
        items={[
          {
            id: 'depositGenerate',
            label: isCollateralEditing ? t('vault-actions.deposit') : t('vault-actions.generate'),
            action: () => {
              setMainAction!('depositGenerate')
            },
          },
          {
            id: 'withdrawPayback',
            label: isCollateralEditing ? t('vault-actions.withdraw') : t('vault-actions.payback'),
            action: () => {
              setMainAction!('withdrawPayback')
            },
          },
        ]}
      />
      {isCollateralEditing && (
        <>
          {isDepositOrGenerate && (
            <>
              <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
              <FieldGenerateDai
                debt={debt}
                disabled={isSecondaryFieldDisabled || !isOwner}
                {...extractFieldGenerateDaiData(props)}
              />
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldWithdrawCollateral
                token={token}
                disabled={!isOwner}
                {...extractFieldWithdrawCollateralData(props)}
              />
              <FieldPaybackDai
                disabled={isSecondaryFieldDisabled}
                {...extractFieldPaybackDaiData(props)}
              />
            </>
          )}
        </>
      )}
      {isDaiEditing && (
        <>
          {isDepositOrGenerate && (
            <>
              <FieldGenerateDai
                debt={debt}
                disabled={!isOwner}
                {...extractFieldGenerateDaiData(props)}
              />
              <FieldDepositCollateral
                token={token}
                disabled={isSecondaryFieldDisabled}
                {...extractFieldDepositCollateralData(props)}
              />
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldPaybackDai {...extractFieldPaybackDaiData(props)} />
              <FieldWithdrawCollateral
                token={token}
                disabled={isSecondaryFieldDisabled || !isOwner}
                {...extractFieldWithdrawCollateralData(props)}
              />
            </>
          )}
        </>
      )}
      {!inputAmountsEmpty && (
        <SidebarResetButton
          clear={() => {
            updateDeposit!()
            updateWithdraw!()
            updateGenerate!()
            updatePayback!()
          }}
        />
      )}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <ManageVaultChangesInformation {...props} />
    </Grid>
  )
}
