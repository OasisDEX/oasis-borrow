import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { BigNumberInput } from 'helpers/BigNumberInput'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Card, Flex, Grid, Heading, Label, Link, Radio, Spinner, Text } from 'theme-ui'
import moment from 'moment'

import { ManageVaultState, ManualChange } from './manageVault'


function ManageVaultDetails({
  afterCollateralizationRatio,
  afterLiquidationPrice,
  token,
  collateralizationRatio,
  liquidationPrice,
  lockedCollateral,
  lockedCollateralPrice,

  currentCollateralPrice,
  nextCollateralPrice,
  isStaticCollateralPrice,
  dateNextCollateralPrice,
  ilk,
  id,
}: ManageVaultState) {
  const { t } = useTranslation()
  const collRatio = collateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(collateralizationRatio.times(100), { precision: 2 })

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const liqPrice = formatAmount(liquidationPrice, 'USD')
  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const locked = formatAmount(lockedCollateral, token)
  const lockedUSD = formatAmount(lockedCollateralPrice, token)

  const tokenInfo = getToken(token)

  const newPriceIn = moment(dateNextCollateralPrice).diff(Date.now(), 'minutes')
  const nextPriceDiff = nextCollateralPrice ? nextCollateralPrice.minus(currentCollateralPrice).div(nextCollateralPrice).times(100) : zero

  const priceChangeColor = nextPriceDiff.isZero()
    ? 'text.muted'
    : nextPriceDiff.gt(zero)
      ? 'onSuccess'
      : 'onError'

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns="1fr 1fr">
      <Heading
        as="h1"
        variant="paragraph2"
        sx={{ gridColumn: '1/3', fontWeight: 'semiBold', borderBottom: 'light', pb: 3 }}
      >
        <Flex>
          <Icon
            name={tokenInfo.iconCircle}
            size="26px"
            sx={{ verticalAlign: 'sub', mr: 2 }}
          />
          <Text>{t('vault.header', { ilk, id })}</Text>
        </Flex>
      </Heading>
      <Box>
        <Heading variant="subheader" as="h2">{t('system.liquidation-price')}</Heading>
        <Text variant="display">${liqPrice}</Text>
        <Text>
          {t('after')}: ${afterLiqPrice}
        </Text>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Heading variant="subheader" as="h2">{t('system.collateralization-ratio')}</Heading>
        <Text variant="display">{collRatio}</Text>
        <Text>
          {t('after')}: {afterCollRatio}
        </Text>
      </Box>
      {isStaticCollateralPrice ? (
        <Box>
          <Heading variant="subheader" as="h2">{`${token}/USD price`}</Heading>
          <Text variant="header2">${formatAmount(currentCollateralPrice, 'USD')}</Text>
        </Box>
      ) : (
        <Box>
          <Box>
            <Heading variant="subheader" as="h2">{`Current ${token}/USD price`}</Heading>
            <Text variant="header2" sx={{ py: 3 }}>${formatAmount(currentCollateralPrice, 'USD')}</Text>
          </Box>

          {
            nextCollateralPrice &&
            <Flex sx={{ alignItems: 'center' }}>
              <Heading variant="subheader" as="h3">
                <Box sx={{ mr: 2 }}>
                  <Text>{t('vault.next-price', { count: newPriceIn })}</Text>
                </Box>
              </Heading>
              <Flex variant="paragraph2" sx={{ fontWeight: 'semiBold', color: priceChangeColor }}>
                <Text >
                  ${formatAmount(nextCollateralPrice || zero, 'USD')}
                </Text>
                <Text sx={{ ml: 2 }}>
                  ({formatPercent(nextPriceDiff, { precision: 2 })})
                </Text>
                {
                  nextPriceDiff.isZero()
                    ? '-'
                    : <Icon sx={{ ml: 2 }} name={nextPriceDiff.gt(zero) ? 'increase' : 'decrease'} />
                }
              </Flex>
            </Flex>
          }
        </Box>
      )}
      <Box sx={{ textAlign: 'right' }}>
        <Heading variant="subheader" as="h2">{t('system.collateral-locked')}</Heading>
        <Text variant="header2" sx={{ py: 3 }}>
          {locked} {token}
        </Text>
        <Text>$ {lockedUSD}</Text>
      </Box>
    </Grid>
  )
}

function ManageVaultFormTitle({
  isEditingStage,
  isProxyStage,
  isCollateralAllowanceStage,
  isDaiAllowanceStage,
  reset,
  stage,
  token,
}: ManageVaultState) {
  const canReset = !!reset

  function handleReset(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canReset) reset!()
  }

  return (
    <Grid pb={3}>
      <Grid columns="2fr 1fr">
        <Text>
          {isEditingStage
            ? 'Manage your Vault'
            : isProxyStage
              ? 'Create Proxy'
              : isCollateralAllowanceStage
                ? `Set ${token} Allowance`
                : isDaiAllowanceStage
                  ? `Set DAI Allowance`
                  : 'Action Vault'}
        </Text>
        {canReset ? (
          <Button onClick={handleReset} disabled={!canReset} sx={{ fontSize: 1, p: 0 }}>
            {stage === 'editing' ? 'Reset' : 'Back'}
          </Button>
        ) : null}
      </Grid>
      <Text sx={{ fontSize: 2 }}>
        Some text here giving a little more context as to what the user is doing
      </Text>
    </Grid>
  )
}

function ManageVaultFormEditing(props: ManageVaultState) {
  const {
    token,
    depositAmount,
    depositAmountUSD,
    maxDepositAmount,
    maxDepositAmountUSD,
    withdrawAmount,
    withdrawAmountUSD,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    generateAmount,
    maxGenerateAmount,
    paybackAmount,
    maxPaybackAmount,
    currentCollateralPrice,
    errorMessages,
    warningMessages,
    ilkDebtAvailable,
    liquidationRatio,
    afterCollateralizationRatio,
    progress,
    change,
    accountIsController,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function clearDeposit(change: (ch: ManualChange) => void) {
    change({
      kind: 'depositAmount',
      depositAmount: undefined,
    })
    change({
      kind: 'depositAmountUSD',
      depositAmountUSD: undefined,
    })
  }

  function clearWithdraw(change: (ch: ManualChange) => void) {
    change({
      kind: 'withdrawAmount',
      withdrawAmount: undefined,
    })
    change({
      kind: 'withdrawAmountUSD',
      withdrawAmountUSD: undefined,
    })
  }

  function clearGenerate(change: (ch: ManualChange) => void) {
    change({
      kind: 'generateAmount',
      generateAmount: undefined,
    })
  }

  function clearPayback(change: (ch: ManualChange) => void) {
    change({
      kind: 'paybackAmount',
      paybackAmount: undefined,
    })
  }

  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined
      const depositAmountUSD = depositAmount
        ? currentCollateralPrice.times(depositAmount)
        : undefined

      clearPayback(change)
      clearWithdraw(change)
      change({
        kind: 'depositAmount',
        depositAmount,
      })
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
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

      clearPayback(change)
      clearWithdraw(change)
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
      change({
        kind: 'depositAmount',
        depositAmount,
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPayback(change)
      clearWithdraw(change)
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
      change({ kind: 'depositAmountUSD', depositAmountUSD: maxDepositAmountUSD })
    }
  }

  function handleWithdrawChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmount = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmountUSD = withdrawAmount
        ? currentCollateralPrice.times(withdrawAmount)
        : undefined

      clearGenerate(change)
      clearDeposit(change)
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
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

      clearGenerate(change)
      clearDeposit(change)
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
    }
  }

  function handleWithdrawMax(change: (ch: ManualChange) => void) {
    return () => {
      clearGenerate(change)
      clearDeposit(change)
      change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
      change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined
      clearPayback(change)
      clearWithdraw(change)
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPayback(change)
      clearWithdraw(change)
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined
      clearGenerate(change)
      clearDeposit(change)
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      clearGenerate(change)
      clearDeposit(change)
      change({ kind: 'paybackAmount', paybackAmount: maxPaybackAmount })
    }
  }

  const { t } = useTranslation()

  const errorString = errorMessages.join(',\n')
  const warningString = warningMessages.join(',\n')

  const hasError = !!errorString
  const hasWarnings = !!warningString

  const daiAvailable = ilkDebtAvailable ? `${formatCryptoBalance(ilkDebtAvailable)} DAI` : '--'
  const minCollRatio = liquidationRatio
    ? `${formatPercent(liquidationRatio.times(100), { precision: 2 })}`
    : '--'
  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  return (
    <Grid>
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
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}
      {hasWarnings && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
        </>
      )}

      <Card>
        <Grid columns="5fr 3fr">
          <Text sx={{ fontSize: 2 }}>{t('system.dai-available')}</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{daiAvailable}</Text>

          <Text sx={{ fontSize: 2 }}>{t('system.min-coll-ratio')}</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{minCollRatio}</Text>

          <Text sx={{ fontSize: 2 }}>{t('system.collateralization-ratio')}</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{afterCollRatio}</Text>
        </Grid>
      </Card>
      <Button onClick={handleProgress} disabled={hasError}>
        {t('confirm')}
      </Button>
    </Grid>
  )
}

function ManageVaultFormProxy({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
  progress,
}: ManageVaultState) {
  const { t } = useTranslation()
  const isLoading = stage === 'proxyInProgress' || stage === 'proxyWaitingForApproval'

  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  const buttonText =
    stage === 'proxySuccess'
      ? t('continue')
      : stage === 'proxyFailure'
        ? t('retry-create-proxy')
        : stage === 'proxyWaitingForConfirmation'
          ? t('create-proxy-btn')
          : t('creating-proxy')

  return (
    <Grid>
      <Button disabled={!canProgress} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'proxyInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('one-of-some', { one: proxyConfirmations || 0, some: safeConfirmations })}:{' '}
                {t('waiting-proxy-deployment')}
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'proxySuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('one-of-some', { one: safeConfirmations, some: safeConfirmations })}:{' '}
                {t('confirmed-proxy-deployment')}
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function ManageVaultFormCollateralAllowance({
  stage,
  collateralAllowanceTxHash,
  etherscan,
  progress,
  token,
  collateralAllowanceAmount,
  change,
  errorMessages,
  depositAmount,
}: ManageVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const isLoading =
    stage === 'collateralAllowanceInProgress' || stage === 'collateralAllowanceWaitingForApproval'
  const canSelectRadio =
    stage === 'collateralAllowanceWaitingForConfirmation' || stage === 'collateralAllowanceFailure'
  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  function handleCustomCollateralAllowanceChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'collateralAllowanceAmount',
        collateralAllowanceAmount: value !== '' ? new BigNumber(value) : undefined,
      })
    }
  }

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
    }
  }

  function handleDeposit() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: depositAmount })
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: undefined })
      setIsCustom(true)
    }
  }

  const { t } = useTranslation()
  const errorString = errorMessages.join(',\n')

  const hasError = !!errorString
  const buttonText =
    stage === 'collateralAllowanceSuccess'
      ? t('continue')
      : stage === 'collateralAllowanceFailure'
        ? t('retry-allowance-approval')
        : stage === 'collateralAllowanceWaitingForConfirmation'
          ? t('approve-allowance')
          : t('approving-allowance')

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>{t('unlimited-allowance')}</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleDeposit}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>{t('custom')}</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
                disabled={!isCustom}
                value={
                  collateralAllowanceAmount && isCustom
                    ? formatAmount(collateralAllowanceAmount, getToken(token).symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken(token).digits,
                  prefix: '',
                })}
                onChange={handleCustomCollateralAllowanceChange(change!)}
              />
              <Text sx={{ fontSize: 1 }}>{token}</Text>
            </Grid>
          </Label>
        </>
      )}
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}

      <Button disabled={!canProgress || hasError} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'collateralAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('setting-allowance-for', { token })}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'collateralAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('set-allowance-for', { token })}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function ManageVaultFormDaiAllowance({
  stage,
  daiAllowanceTxHash,
  etherscan,
  progress,
  daiAllowanceAmount,
  change,
  errorMessages,
  paybackAmount,
}: ManageVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const isLoading = stage === 'daiAllowanceInProgress' || stage === 'daiAllowanceWaitingForApproval'
  const canSelectRadio =
    stage === 'daiAllowanceWaitingForConfirmation' || stage === 'daiAllowanceFailure'
  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  function handleCustomDaiAllowanceChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'daiAllowanceAmount',
        daiAllowanceAmount: value !== '' ? new BigNumber(value) : undefined,
      })
    }
  }

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
    }
  }

  function handlePayback() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: paybackAmount })
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: undefined })
      setIsCustom(true)
    }
  }

  const errorString = errorMessages.join(',\n')
  const { t } = useTranslation()

  const hasError = !!errorString
  const buttonText =
    stage === 'daiAllowanceSuccess'
      ? t('view-on-etherscan')
      : stage === 'daiAllowanceFailure'
        ? t('retry-allowance-approval')
        : stage === 'daiAllowanceWaitingForConfirmation'
          ? t('approve-allowance')
          : t('approving-allowance')

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>{t('unlimited-allowance')}</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handlePayback}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              {t('dai-paying-back', { amount: formatCryptoBalance(paybackAmount!) })}
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>{t('custom')}</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
                disabled={!isCustom}
                value={
                  daiAllowanceAmount && isCustom
                    ? formatAmount(daiAllowanceAmount, getToken('DAI').symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken('DAI').digits,
                  prefix: '',
                })}
                onChange={handleCustomDaiAllowanceChange(change!)}
              />
              <Text sx={{ fontSize: 1 }}>DAI</Text>
            </Grid>
          </Label>
        </>
      )}
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}

      <Button disabled={!canProgress || hasError} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'daiAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('setting-allowance-for', { token: 'DAI' })}
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'daiAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('set-allowance-for', { token: 'DAI' })}
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function ManageVaultFormConfirmation({
  stage,
  collateralBalance,
  depositAmount,
  generateAmount,
  paybackAmount,
  withdrawAmount,
  token,
  afterCollateralizationRatio,
  afterLiquidationPrice,
  progress,
  etherscan,
  manageTxHash,
}: ManageVaultState) {
  const { t } = useTranslation()
  const walletBalance = formatCryptoBalance(collateralBalance)
  const depositCollateral = formatCryptoBalance(depositAmount || zero)
  const withdrawingCollateral = formatCryptoBalance(withdrawAmount || zero)
  const remainingInWallet = formatCryptoBalance(
    depositAmount ? collateralBalance.minus(depositAmount) : collateralBalance,
  )
  const daiToBeGenerated = formatCryptoBalance(generateAmount || zero)
  const daiPayingBack = formatCryptoBalance(paybackAmount || zero)

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const canProgress = !!progress || stage === 'manageSuccess'
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (progress) progress!()
  }
  const isLoading = stage === 'manageInProgress' || stage === 'manageWaitingForApproval'

  const buttonText =
    stage === 'manageWaitingForConfirmation'
      ? t('change-your-vault')
      : stage === 'manageFailure'
        ? t('retry')
        : stage === 'manageSuccess'
          ? t('back-to-editing')
          : t('change-your-vault')

  return (
    <Grid>
      <Card backgroundColor="Success">
        <Grid columns="1fr 1fr">
          <Text sx={{ fontSize: 1 }}>{t('system.in-your-wallet')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {walletBalance} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('moving-into-vault')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {depositCollateral} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('moving-out-vault')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {withdrawingCollateral} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('remaining-in-wallet')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {remainingInWallet} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('dai-being-generated')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiToBeGenerated} DAI</Text>

          <Text sx={{ fontSize: 1 }}>{t('dai-paying-back')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiPayingBack} DAI</Text>

          <Text sx={{ fontSize: 1 }}>{t('system.collateral-ratio')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{afterCollRatio}</Text>

          <Text sx={{ fontSize: 1 }}>{t('system.liquidation-price')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>${afterLiqPrice}</Text>
        </Grid>
      </Card>
      <Button disabled={!canProgress} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>

      {stage === 'manageInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('changing-vault')}
              </Text>
              <Link
                href={`${etherscan}/tx/${manageTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'manageSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('vault-changed')}
              </Text>
              <Link
                href={`${etherscan}/tx/${manageTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
  } = props

  return (
    <Box>
      <Card>
        <ManageVaultFormTitle {...props} />
        {isEditingStage && <ManageVaultFormEditing {...props} />}
        {isProxyStage && <ManageVaultFormProxy {...props} />}
        {isCollateralAllowanceStage && <ManageVaultFormCollateralAllowance {...props} />}
        {isDaiAllowanceStage && <ManageVaultFormDaiAllowance {...props} />}
        {isManageStage && <ManageVaultFormConfirmation {...props} />}
      </Card>
    </Box>
  )
}

function VaultDetails(props: ManageVaultState) {
  const { t } = useTranslation()
  return (
    <Box sx={{ gridColumn: '1/2' }}>
      <Heading variant="header3" mb="4">
        {t('vault.vault-details')}
      </Heading>
      <Grid columns="1fr 1fr 1fr" sx={{ border: 'light', borderRadius: 'medium', p: 4 }}>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.vault-dai-debt')}
          </Box>
          <Box>
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatCryptoBalance(props.debt)}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              DAI
            </Text>
          </Box>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.available-to-withdraw')}
          </Box>
          <Box variant="text.header3">
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatFiatBalance(props.freeCollateral)}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              USD
            </Text>
          </Box>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.available-to-generate')}
          </Box>
          <Box variant="text.header3">
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatCryptoBalance(props.maxGenerateAmount)}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              USD
            </Text>
          </Box>
        </Box>
        <Box sx={{ gridColumn: '1/4', borderBottom: 'light', height: '1px', my: 3 }} />
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.liquidation-ratio')}
          </Box>
          <Text sx={{ display: 'inline' }} variant="header3">
            {formatPercent(props.liquidationRatio.times(100))}
          </Text>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.stability-fee')}
          </Box>
          <Box variant="text.header3">{formatPercent(props.stabilityFee.times(100))}</Box>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.liquidation-penalty')}
          </Box>
          <Box variant="text.header3">{formatPercent(props.liquidationPenalty.times(100))}</Box>
        </Box>
      </Grid>
    </Box>
  )
}

export function ManageVaultContainer(props: ManageVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <ManageVaultDetails {...props} />
      <ManageVaultForm {...props} />
      <VaultDetails {...props} />
    </Grid>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$ } = useAppContext()
  const manageVault = useObservable(manageVault$(id))
  if (!manageVault) return null

  return (
    <Grid>
      <ManageVaultContainer {...manageVault} />
    </Grid>
  )
}
