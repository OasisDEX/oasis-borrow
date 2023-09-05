import { ActionPills } from 'components/ActionPills'
import {
  extractFieldDepositCollateralData,
  extractFieldDepositDaiData,
  extractFieldGenerateDaiData,
  extractFieldPaybackDaiData,
  extractFieldWithdrawCollateralData,
  FieldDepositCollateral,
  FieldDepositDai,
  FieldGenerateDai,
  FieldPaybackDai,
  FieldWithdrawCollateral,
} from 'components/vault/sidebar/SidebarFields'
import { OptionalAdjust } from 'components/vault/sidebar/SidebarOptionalAdjust'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import {
  otherActionsCollateralPanel,
  otherActionsDaiPanel,
} from 'features/multiply/manage/sidebars/SidebarManageMultiplyVault'
import { extractCommonErrors, extractCommonWarnings } from 'helpers/messageMappers'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { SidebarManageMultiplyVaultEditingStageClose } from './SidebarManageMultiplyVaultEditingStageClose'
import { SliderAdjustMultiply } from './SliderAdjustMultiply'
import { VaultType } from 'features/generalManageVault/vaultType'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'

function SidebarManageMultiplyVaultEditingStageDepositCollateral(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    depositAmount,
    showSliderController,
    toggleSliderController,
    vault: { token },
    accountIsController,
  } = props

  return (
    <>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <OptionalAdjust
        label={t('adjust-your-position-additional')}
        isVisible={depositAmount?.gt(zero) && accountIsController}
        isExpanded={showSliderController}
        clickHandler={toggleSliderController}
      >
        <SliderAdjustMultiply collapsed={true} {...props} />
      </OptionalAdjust>
    </>
  )
}

function SidebarManageMultiplyVaultEditingStageWithdrawCollateral(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    withdrawAmount,
    vault: { debt, token },
    showSliderController,
    toggleSliderController,
  } = props

  return (
    <>
      <FieldWithdrawCollateral token={token} {...extractFieldWithdrawCollateralData(props)} />
      <OptionalAdjust
        label={t('adjust-your-position-additional')}
        isVisible={withdrawAmount?.gt(zero) && debt.gt(zero)}
        isExpanded={showSliderController}
        clickHandler={toggleSliderController}
      >
        <SliderAdjustMultiply collapsed={true} {...props} />
      </OptionalAdjust>
    </>
  )
}

function SidebarManageMultiplyVaultEditingStageDepositDai(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    depositDaiAmount,
    vault: { token },
  } = props

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('system.multiply-buy-coll', { token })}
      </Text>
      <FieldDepositDai {...extractFieldDepositDaiData(props)} />
      <SliderAdjustMultiply {...props} disabled={!depositDaiAmount} />
    </>
  )
}

function SidebarManageMultiplyVaultEditingStagePaybackDai(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('system.multiply-reduce-debt')}
      </Text>
      <FieldPaybackDai {...extractFieldPaybackDaiData(props)} />
    </>
  )
}

function SidebarManageMultiplyVaultEditingStageWithdrawDai(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    generateAmount,
    vault: { debt },
    showSliderController,
    toggleSliderController,
  } = props

  return (
    <>
      <FieldGenerateDai debt={debt} action="Withdraw" {...extractFieldGenerateDaiData(props)} />
      <OptionalAdjust
        label={t('adjust-your-position-additional')}
        isVisible={generateAmount?.gt(zero) && debt.gt(zero)}
        isExpanded={showSliderController}
        clickHandler={toggleSliderController}
      >
        <SliderAdjustMultiply collapsed={true} {...props} />
      </OptionalAdjust>
    </>
  )
}

export function SidebarManageMultiplyVaultEditingStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    errorMessages,
    inputAmountsEmpty,
    otherAction,
    setOtherAction,
    stage,
    updateDepositAmount,
    updateDepositDaiAmount,
    updateGenerateAmount,
    updatePaybackAmount,
    updateWithdrawAmount,
    vault: { debt },
    warningMessages,
    vaultType,
  } = props

  return (
    <Grid gap={3}>
      {stage === 'adjustPosition' && <SliderAdjustMultiply {...props} />}
      {stage === 'otherActions' && (
        <>
          {otherActionsCollateralPanel.includes(otherAction) && (
            <>
              <ActionPills
                active={otherAction}
                items={[
                  {
                    id: 'depositCollateral',
                    label: t('deposit'),
                    action: () => {
                      setOtherAction!('depositCollateral')
                    },
                  },
                  {
                    id: 'withdrawCollateral',
                    label: t('withdraw'),
                    action: () => {
                      setOtherAction!('withdrawCollateral')
                    },
                  },
                ]}
              />
              {otherAction === 'depositCollateral' && (
                <SidebarManageMultiplyVaultEditingStageDepositCollateral {...props} />
              )}
              {otherAction === 'withdrawCollateral' && (
                <SidebarManageMultiplyVaultEditingStageWithdrawCollateral {...props} />
              )}
            </>
          )}
          {otherActionsDaiPanel.includes(otherAction) && (
            <>
              <ActionPills
                active={otherAction}
                items={[
                  {
                    id: 'depositDai',
                    label: t('system.actions.multiply.buy-coll'),
                    action: () => {
                      setOtherAction!('depositDai')
                    },
                  },
                  {
                    id: 'paybackDai',
                    label: t('system.actions.multiply.reduce-debt'),
                    action: () => {
                      setOtherAction!('paybackDai')
                    },
                  },
                  {
                    id: 'withdrawDai',
                    label: t('withdraw'),
                    action: () => {
                      setOtherAction!('withdrawDai')
                    },
                  },
                ]}
              />
              {otherAction === 'depositDai' && (
                <SidebarManageMultiplyVaultEditingStageDepositDai {...props} />
              )}
              {otherAction === 'paybackDai' && (
                <SidebarManageMultiplyVaultEditingStagePaybackDai {...props} />
              )}
              {otherAction === 'withdrawDai' && (
                <SidebarManageMultiplyVaultEditingStageWithdrawDai {...props} />
              )}
            </>
          )}
          {otherAction === 'closeVault' && debt.isGreaterThan(zero) && debt && (
            <SidebarManageMultiplyVaultEditingStageClose {...props} />
          )}
        </>
      )}
      {!inputAmountsEmpty && otherAction !== 'closeVault' && (
        <SidebarResetButton
          clear={() => {
            updateDepositAmount!()
            updateDepositDaiAmount!()
            updateWithdrawAmount!()
            updatePaybackAmount!()
            updateGenerateAmount!()
          }}
        />
      )}

      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      {vaultType === VaultType.Multiply 
        ? <ManageMultiplyVaultChangesInformation {...props} /> 
        : <ManageVaultChangesInformation {...props} />}
    </Grid>
  )
}
