// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'

import { BigNumber } from 'bignumber.js'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Grid, Text } from 'theme-ui'
import { ManageVaultState, ManualChange } from './manageVault'

const PlusIcon = () => (
  <Icon
    name="plus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 2 }}
  />
)
const MinusIcon = () => (
  <Icon
    name="support_minus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 2 }}
  />
)

function DepositInput({
  stage,
  currentCollateralPrice,
  change,
  clearPaybackAndWithdraw,
  clearDepositAndGenerate,
  maxDepositAmount,
  maxDepositAmountUSD,
  token,
  depositAmount,
  depositAmountUSD,
}: ManageVaultState) {
  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined
      const depositAmountUSD = depositAmount
        ? currentCollateralPrice.times(depositAmount)
        : undefined

      clearPaybackAndWithdraw!()
      change({
        kind: 'depositAmount',
        depositAmount,
      })
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
      if (!depositAmount && stage === 'collateralEditing') {
        clearDepositAndGenerate!()
      }
    }
  }

  function handleDepositUSDChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmountUSD = value !== '' ? new BigNumber(value) : undefined
      const depositAmount =
        depositAmountUSD && depositAmountUSD.gt(zero)
          ? depositAmountUSD.div(currentCollateralPrice)
          : undefined

      clearPaybackAndWithdraw!()
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
      change({
        kind: 'depositAmount',
        depositAmount,
      })
      if (!depositAmountUSD && stage === 'collateralEditing') {
        clearDepositAndGenerate!()
      }
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPaybackAndWithdraw!()
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
      change({ kind: 'depositAmountUSD', depositAmountUSD: maxDepositAmountUSD })
    }
  }

  return (
    <VaultActionInput
      action="Deposit"
      token={token}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={handleDepositMax(change!)}
      maxAmountLabel={'Balance'}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onChange={handleDepositChange(change!)}
      onAuxiliaryChange={handleDepositUSDChange(change!)}
      hasError={false}
    />
  )
}

function GenerateInput({
  generateAmount,
  accountIsController,
  maxGenerateAmount,
  clearPaybackAndWithdraw,
  clearDepositAndGenerate,
  change,
  stage,
}: ManageVaultState) {
  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined

      clearPaybackAndWithdraw!()
      change({
        kind: 'generateAmount',
        generateAmount,
      })
      if (!generateAmount && stage === 'daiEditing') {
        clearDepositAndGenerate!()
      }
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPaybackAndWithdraw!()
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  return (
    <VaultActionInput
      action="Generate"
      amount={generateAmount}
      token={'DAI'}
      showMax={true}
      disabled={!accountIsController}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={'Maximum'}
      onSetMax={handleGenerateMax(change!)}
      onChange={handleGenerateChange(change!)}
      hasError={false}
    />
  )
}

function WithdrawInput({
  currentCollateralPrice,
  change,
  accountIsController,
  withdrawAmount,
  withdrawAmountUSD,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  token,
  clearDepositAndGenerate,
  clearPaybackAndWithdraw,
  stage,
}: ManageVaultState) {
  function handleWithdrawChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmount = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmountUSD = withdrawAmount
        ? currentCollateralPrice.times(withdrawAmount)
        : undefined

      clearDepositAndGenerate!()
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
      if (!withdrawAmount && stage === 'collateralEditing') {
        clearPaybackAndWithdraw!()
      }
    }
  }

  function handleWithdrawUSDChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmountUSD = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmount =
        withdrawAmountUSD && withdrawAmountUSD.gt(zero)
          ? withdrawAmountUSD.div(currentCollateralPrice)
          : undefined

      clearDepositAndGenerate!()
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
      if (!withdrawAmountUSD && stage === 'collateralEditing') {
        clearPaybackAndWithdraw!()
      }
    }
  }

  function handleWithdrawMax(change: (ch: ManualChange) => void) {
    return () => {
      clearDepositAndGenerate!()
      change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
      change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
    }
  }

  return (
    <VaultActionInput
      action="Withdraw"
      showMax={true}
      hasAuxiliary={true}
      onSetMax={handleWithdrawMax(change!)}
      disabled={!accountIsController}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={'Free'}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      token={token}
      hasError={false}
      onChange={handleWithdrawChange(change!)}
      onAuxiliaryChange={handleWithdrawUSDChange(change!)}
    />
  )
}
function PaybackInput({
  paybackAmount,
  maxPaybackAmount,
  change,
  clearDepositAndGenerate,
  clearPaybackAndWithdraw,
  stage,
}: ManageVaultState) {
  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined

      clearDepositAndGenerate!()
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
      if (!paybackAmount && stage === 'daiEditing') {
        clearPaybackAndWithdraw!()
      }
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      clearDepositAndGenerate!()
      change({ kind: 'paybackAmount', paybackAmount: maxPaybackAmount })
    }
  }

  return (
    <VaultActionInput
      action="Payback"
      amount={paybackAmount}
      token={'DAI'}
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={'Maximum'}
      onSetMax={handlePaybackMax(change!)}
      onChange={handlePaybackChange(change!)}
      hasError={false}
    />
  )
}

function ManageVaultFormDetails({
  ilkDebtAvailable,
  liquidationRatio,
  stabilityFee,
  liquidationPenalty,
  debtFloor,
}: ManageVaultState) {
  const { t } = useTranslation()

  return (
    <Card bg="secondaryAlt" sx={{ border: 'none' }}>
      <Grid columns={'2fr 3fr'}>
        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.dai-available')}</Text>
          <Text sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}>{`${formatAmount(
            ilkDebtAvailable,
            'DAI',
          )} DAI`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.min-collat-ratio')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(liquidationRatio.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.stability-fee')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.liquidation-fee')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(liquidationPenalty.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.dust-limit')}</Text>
          <Text sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}>{`${formatAmount(
            debtFloor,
            'DAI',
          )} DAI`}</Text>
        </>
      </Grid>
    </Card>
  )
}

export function ManageVaultFormEditing(props: ManageVaultState) {
  const { t } = useTranslation()

  const [showDepositAndGenerateOption, setShowDepositAndGenerateOption] = useState<boolean>(false)
  const [showPaybackAndWithdrawOption, setShowPaybackAndWithdrawOption] = useState<boolean>(false)
  const [showManageVaultFormDetails, setShowManageVaultFormDetails] = useState<boolean>(false)

  const {
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    errorMessages,
    warningMessages,
    progress,
    stage,
    token,
  } = props

  function toggleDepositAndGenerateOption(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setShowDepositAndGenerateOption(!showDepositAndGenerateOption)
  }

  function togglePaybackAndWithdrawOption(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setShowPaybackAndWithdrawOption(!showPaybackAndWithdrawOption)
  }

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setShowManageVaultFormDetails(true)
  }
  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setShowManageVaultFormDetails(false)
  }

  const errorString = errorMessages.join(',\n')
  const warningString = warningMessages.join(',\n')

  const hasError = !!errorString
  const hasWarnings = !!warningString

  const disableDepositAndGenerate = paybackAmount || withdrawAmount || showPaybackAndWithdrawOption
  const disablePaybackAndWithdraw = depositAmount || generateAmount || showDepositAndGenerateOption

  const inverted = stage === 'daiEditing'

  useEffect(() => {
    setShowDepositAndGenerateOption(false)
    setShowPaybackAndWithdrawOption(false)
  }, [stage])

  const showDepositAndGenerateOptionText = depositAmount || generateAmount
  const showPaybackAndWithdrawOptionText = paybackAmount || withdrawAmount

  return (
    <Grid onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Box
        sx={{
          opacity: disableDepositAndGenerate ? 0.5 : 1,
          pointerEvents: disableDepositAndGenerate ? 'none' : 'auto',
        }}
      >
        {inverted ? <GenerateInput {...props} /> : <DepositInput {...props} />}
        {showDepositAndGenerateOptionText && (
          <Text
            mt={3}
            sx={{
              cursor: 'pointer',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: 'onSuccess',
              userSelect: 'none',
            }}
            onClick={toggleDepositAndGenerateOption}
          >
            {showDepositAndGenerateOption ? <MinusIcon /> : <PlusIcon />}
            {t('manage-vault.action-option', {
              action: inverted ? t('vault-actions.deposit') : t('vault-actions.generate'),
              token: inverted ? token : 'DAI',
            })}
          </Text>
        )}
        {showDepositAndGenerateOption &&
          (!!depositAmount || !!generateAmount) &&
          (inverted ? <DepositInput {...props} /> : <GenerateInput {...props} />)}
      </Box>

      <Flex sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
        <Box sx={{ borderBottom: 'light', height: '0px', width: '100%' }} />
        <Text mx={3} sx={{ minWidth: 'fit-content' }}>
          {t('manage-vault.or')}
        </Text>
        <Box sx={{ borderBottom: 'light', height: '0px', width: '100%' }} />
      </Flex>

      <Box
        sx={{
          opacity: disablePaybackAndWithdraw ? 0.5 : 1,
          pointerEvents: disablePaybackAndWithdraw ? 'none' : 'auto',
        }}
      >
        {inverted ? <PaybackInput {...props} /> : <WithdrawInput {...props} />}
        {showPaybackAndWithdrawOptionText && (
          <Text
            mt={3}
            sx={{
              cursor: 'pointer',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: 'onSuccess',
              userSelect: 'none',
            }}
            onClick={togglePaybackAndWithdrawOption}
          >
            {showPaybackAndWithdrawOption ? <MinusIcon /> : <PlusIcon />}
            {t('manage-vault.action-option', {
              action: inverted ? t('vault-actions.withdraw') : t('vault-actions.payback'),
              token: inverted ? token : 'DAI',
            })}
          </Text>
        )}
        {showPaybackAndWithdrawOption &&
          (!!paybackAmount || !!withdrawAmount) &&
          (inverted ? <WithdrawInput {...props} /> : <PaybackInput {...props} />)}
      </Box>

      {hasError && (
        <Card variant="danger">
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </Card>
      )}
      {hasWarnings && (
        <Card variant="warning">
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
        </Card>
      )}
      <Button onClick={handleProgress} disabled={hasError}>
        {t('confirm')}
      </Button>
      {showManageVaultFormDetails && <ManageVaultFormDetails {...props} />}
    </Grid>
  )
}
