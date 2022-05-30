import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { MinusIcon, PlusIcon, VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { MAX_COLL_RATIO } from 'features/multiply/open/pipes/openMultiplyVaultCalculations'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactChild } from 'react'
import { Box, Button, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { otherActionsCollateralPanel, otherActionsDaiPanel } from './SidebarManageMultiplyVault'
import { SidebarResetButton } from './SidebarResetButton'

interface FieldProps extends ManageMultiplyVaultState {
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

function SliderAdjustMultiply(props: FieldProps & { collapsed?: boolean }) {
  const { t } = useTranslation()

  const {
    theme: { colors },
  } = useThemeUI()

  const {
    vault: { collateralizationRatio },
    afterCollateralizationRatio,
    afterLiquidationPrice,
    ilkData: { liquidationRatio },
    requiredCollRatio,
    updateRequiredCollRatio,
    maxCollRatio,
    minCollRatio,
    multiply,
    hasToDepositCollateralOnEmptyVault,
    disabled = false,
    collapsed,
  } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const sliderValue = requiredCollRatio || collateralizationRatio || maxCollRatio
  const sliderMax = maxCollRatio || MAX_COLL_RATIO
  const sliderMin = minCollRatio || liquidationRatio
  const slider = new BigNumber(100).minus(
    sliderValue.minus(sliderMin).div(sliderMax.minus(sliderMin)).times(100) || zero,
  )

  const sliderBackground =
    multiply && !multiply.isNaN() && slider
      ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${colors?.sliderTrackFill} ${
          slider.toNumber() || 0
        }%, ${colors?.primaryAlt} ${slider.toNumber() || 0}%, ${colors?.primaryAlt} 100%)`
      : 'primaryAlt'

  return (
    <Grid
      gap={2}
      sx={
        collapsed
          ? {
              px: 3,
              py: 2,
              border: 'lightMuted',
              borderTop: 'none',
              borderBottomLeftRadius: 'mediumLarge',
              borderBottomRightRadius: 'mediumLarge',
            }
          : {}
      }
    >
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          fontWeight: 'semiBold',
          color: 'text.subtitle',
        }}
      >
        <Grid as="p" gap={2}>
          <Text as="span">{t('system.liquidation-price')}</Text>
          <Text as="span" variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
            ${formatAmount(afterLiquidationPrice, 'USD')}
          </Text>
        </Grid>
        <Grid as="p" gap={2}>
          <Text as="span">{t('system.collateral-ratio')}</Text>
          <Text
            as="span"
            variant="paragraph1"
            sx={{ fontWeight: 'semiBold', textAlign: 'right', color: collRatioColor }}
          >
            {formatPercent(afterCollateralizationRatio.times(100))}
          </Text>
        </Grid>
      </Flex>
      <Box my={1}>
        <Slider
          sx={{
            background: sliderBackground,
            direction: 'rtl',
          }}
          disabled={hasToDepositCollateralOnEmptyVault || disabled}
          step={0.05}
          min={sliderMin.toNumber()}
          max={sliderMax.toNumber()}
          value={requiredCollRatio?.toNumber() || collateralizationRatio.toNumber()}
          onChange={(e) => {
            updateRequiredCollRatio!(new BigNumber(e.target.value))
          }}
        />
      </Box>
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          color: 'text.subtitle',
        }}
      >
        <Text as="span">{t('slider.adjust-multiply.left-footer')}</Text>
        <Text as="span">{t('slider.adjust-multiply.right-footer')}</Text>
      </Flex>
    </Grid>
  )
}

function FieldDepositCollateral({
  maxDepositAmount,
  maxDepositAmountUSD,
  vault: { token },
  depositAmount,
  depositAmountUSD,
  updateDepositAmount,
  updateDepositAmountUSD,
  updateDepositAmountMax,
  priceInfo: { currentCollateralPrice },
  disabled = false,
}: FieldProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositAmountMax}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      onChange={handleNumericInput(updateDepositAmount!)}
      onAuxiliaryChange={handleNumericInput(updateDepositAmountUSD!)}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      maxAmountLabel={t('balance')}
      hasError={false}
      disabled={disabled}
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

function FieldWithdrawCollateral({
  withdrawAmount,
  withdrawAmountUSD,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  vault: { token },
  updateWithdrawAmount,
  updateWithdrawAmountUSD,
  updateWithdrawAmountMax,
  priceInfo: { currentCollateralPrice },
  disabled = false,
}: FieldProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Withdraw"
      showMax={true}
      hasAuxiliary={true}
      tokenUsdPrice={currentCollateralPrice}
      onSetMax={updateWithdrawAmountMax}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={t('max')}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      token={token}
      hasError={false}
      onChange={handleNumericInput(updateWithdrawAmount!)}
      onAuxiliaryChange={handleNumericInput(updateWithdrawAmountUSD!)}
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
  const { depositAmount, showSliderController, toggleSliderController } = props

  return (
    <>
      <FieldDepositCollateral {...props} />
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
    vault: { debt },
    showSliderController,
    toggleSliderController,
  } = props

  return (
    <>
      <FieldWithdrawCollateral {...props} />
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
    stage,
    otherAction,
    setOtherAction,
    inputAmountsEmpty,
    updateDepositAmount,
    updateDepositDaiAmount,
    updateWithdrawAmount,
    updatePaybackAmount,
    updateGenerateAmount,
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
      {!inputAmountsEmpty && (
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
