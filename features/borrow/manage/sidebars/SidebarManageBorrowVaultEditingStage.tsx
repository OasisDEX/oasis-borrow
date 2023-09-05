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
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { SidebarManageMultiplyVaultEditingStageClose } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVaultEditingStageClose'
import { SliderAdjustMultiply } from 'features/multiply/manage/sidebars/SliderAdjustMultiply'
import { extractCommonErrors, extractCommonWarnings } from 'helpers/messageMappers'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageBorrowVaultEditingStage(props: ManageMultiplyVaultState) {
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
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    stage,
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    updateDepositAmount,
    updateGenerateAmount,
    updatePaybackAmount,
    updateWithdrawAmount,
    vault: { debt, token },
    warningMessages,
    withdrawAmount,
    otherAction,
    setOtherAction,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  const isOwner = accountIsConnected && accountIsController
  const isCollateralEditing = stage === 'otherActions' && (otherAction === 'depositCollateral' || otherAction === 'withdrawCollateral' || otherAction === 'withdrawDai')
  const isDaiEditing = stage === 'otherActions' && (otherAction === 'depositDai' || otherAction === 'paybackDai')
  const isDepositOrGenerate = otherAction === 'depositCollateral'
  const isWithdrawOrPayback = otherAction === 'withdrawCollateral'

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
      {stage === 'adjustPosition' && <SliderAdjustMultiply {...props} />}
      {stage === 'otherActions' &&
        otherAction === 'closeVault' &&
        debt.isGreaterThan(zero) &&
        debt && <SidebarManageMultiplyVaultEditingStageClose {...props} />}
      {stage !== 'otherActions' && stage !== 'adjustPosition' && (
        <>
          <ActionPills
            active={mainAction}
            items={[
              {
                id: 'depositGenerate',
                label: isCollateralEditing
                  ? t('vault-actions.deposit')
                  : t('vault-actions.generate'),
                action: () => {
                  setOtherAction!('depositCollateral')
                },
              },
              {
                id: 'withdrawPayback',
                label: isCollateralEditing
                  ? t('vault-actions.withdraw')
                  : t('vault-actions.payback'),
                action: () => {
                  setOtherAction!('withdrawCollateral')
                },
              },
            ]}
          />
          {isCollateralEditing && (
            <>
              {isDepositOrGenerate && (
                <>
                  <FieldDepositCollateral
                    token={token}
                    {...extractFieldDepositCollateralData(props)}
                  />
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
        </>
      )}
      {!inputAmountsEmpty && (
        <SidebarResetButton
          clear={() => {
            updateDepositAmount!()
            updateWithdrawAmount!()
            updateGenerateAmount!()
            updatePaybackAmount!()
          }}
        />
      )}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <ManageVaultChangesInformation {...props} />
    </Grid>
  )
}
