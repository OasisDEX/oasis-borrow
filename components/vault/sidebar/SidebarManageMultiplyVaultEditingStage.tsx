import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import {
  extractFieldDepositCollateralData,
  extractFieldWithdrawCollateralData,
  FieldDepositCollateral,
  FieldWithdrawCollateral,
} from 'components/vault/sidebar/SidebarFields'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarSliderAdjustMultiply } from 'components/vault/sidebar/SidebarSlider'
import { MinusIcon, PlusIcon, VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { MAX_COLL_RATIO } from 'features/multiply/open/pipes/openMultiplyVaultCalculations'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactChild } from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { otherActionsCollateralPanel, otherActionsDaiPanel } from './SidebarManageMultiplyVault'

interface FieldProps extends ManageMultiplyVaultState {
  disabled?: boolean
}

interface SliderAdjustMultiplyParams extends ManageMultiplyVaultState {
  collapsed?: boolean
  disabled?: boolean
}

interface OptionalAdjustProps {
  label: string
  isVisible?: boolean
  isExpanded: boolean
  clickHandler?: () => void
  children: ReactChild
}

function OptionalAdjust({
  label,
  isVisible,
  isExpanded,
  clickHandler,
  children,
}: OptionalAdjustProps) {
  return (
    <>
      {isVisible && (
        <Box>
          <Button variant={`actionOption${isExpanded ? 'Opened' : ''}`} onClick={clickHandler}>
            {isExpanded ? <MinusIcon /> : <PlusIcon />}
            {label}
          </Button>
          {isExpanded && <Box>{children}</Box>}
        </Box>
      )}
    </>
  )
}

function SliderAdjustMultiply({ collapsed, disabled, ...props }: SliderAdjustMultiplyParams) {
  const {
    vault: { collateralizationRatio },
    ilkData: { liquidationRatio },
    requiredCollRatio,
    updateRequiredCollRatio,
    maxCollRatio,
    minCollRatio,
    hasToDepositCollateralOnEmptyVault,
  } = props

  const sliderMax = maxCollRatio || MAX_COLL_RATIO
  const sliderMin = minCollRatio || liquidationRatio

  return (
    <SidebarSliderAdjustMultiply
      state={props}
      min={sliderMin.toNumber()}
      max={sliderMax.toNumber()}
      value={requiredCollRatio?.toNumber() || collateralizationRatio.toNumber()}
      onChange={(e) => {
        updateRequiredCollRatio!(new BigNumber(e.target.value))
      }}
      collapsed={collapsed}
      disabled={hasToDepositCollateralOnEmptyVault || disabled}
    />
  )
}

function FieldDepositDai({
  depositDaiAmount,
  updateDepositDaiAmount,
  updateDepositDaiAmountMax,
  maxDepositDaiAmount,
  disabled = false,
}: FieldProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      amount={depositDaiAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxDepositDaiAmount}
      maxAmountLabel={t('max')}
      onSetMax={updateDepositDaiAmountMax}
      onChange={handleNumericInput(updateDepositDaiAmount!)}
      hasError={false}
      disabled={disabled}
    />
  )
}

function FieldPaybackDai({
  paybackAmount,
  updatePaybackAmount,
  updatePaybackAmountMax,
  maxPaybackAmount,
  disabled = false,
}: FieldProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      amount={paybackAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={t('max')}
      onSetMax={updatePaybackAmountMax}
      onChange={handleNumericInput(updatePaybackAmount!)}
      hasError={false}
      disabled={disabled}
    />
  )
}

function FieldGenerateDai({
  generateAmount,
  updateGenerateAmount,
  updateGenerateAmountMax,
  maxGenerateAmount,
  disabled = false,
}: FieldProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Withdraw"
      amount={generateAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={t('max')}
      onSetMax={updateGenerateAmountMax}
      onChange={handleNumericInput(updateGenerateAmount!)}
      hasError={false}
      disabled={disabled}
    />
  )
}

function SidebarManageMultiplyVaultEditingStageClose(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    closeVaultTo,
    setCloseVaultTo,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
    afterCloseToDai,
    vault: { token },
  } = props

  const isClosingToCollateral = closeVaultTo === 'collateral'
  const closeToTokenSymbol = isClosingToCollateral ? token : 'DAI'

  return (
    <>
      <ActionPills
        active={closeVaultTo}
        items={[
          {
            id: 'collateral',
            label: t('close-to', { token }),
            action: () => {
              setCloseVaultTo!('collateral')
            },
          },
          {
            id: 'dai',
            label: t('close-to', { token: 'DAI' }),
            action: () => {
              setCloseVaultTo!('dai')
            },
          },
        ]}
      />
      <Text as="p" variant="paragraph3" sx={{ mt: 2, color: 'text.subtitle' }}>
        {t('vault-info-messages.closing')}
      </Text>
      <Text
        as="p"
        variant="paragraph3"
        sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'semiBold' }}
      >
        <Text as="span" sx={{ display: 'flex', alignItems: 'flex-end', color: 'text.subtitle' }}>
          <Icon name={getToken(closeToTokenSymbol).iconCircle} size="20px" sx={{ mr: 1 }} />
          {t('after-closing', { token: closeToTokenSymbol })}
        </Text>
        <Text as="span">
          {formatCryptoBalance(isClosingToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
          {closeToTokenSymbol}{' '}
          {isClosingToCollateral && `($${formatAmount(afterCloseToCollateralUSD, 'USD')})`}
        </Text>
      </Text>
    </>
  )
}

function SidebarManageMultiplyVaultEditingStageDepositCollateral(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    depositAmount,
    showSliderController,
    toggleSliderController,
    vault: { token },
  } = props

  return (
    <>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <OptionalAdjust
        label={t('adjust-your-position-additional')}
        isVisible={depositAmount?.gt(zero)}
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
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('system.multiply-buy-coll', { token })}
      </Text>
      <FieldDepositDai {...props} />
      <SliderAdjustMultiply {...props} disabled={!depositDaiAmount} />
    </>
  )
}

function SidebarManageMultiplyVaultEditingStagePaybackDai(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('system.multiply-reduce-debt')}
      </Text>
      <FieldPaybackDai {...props} />
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
      <FieldGenerateDai {...props} />
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
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
