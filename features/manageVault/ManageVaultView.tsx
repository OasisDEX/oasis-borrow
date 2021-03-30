import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { BigNumberInput } from 'helpers/BigNumberInput'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { Trans, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Card, Flex, Grid, Heading, Label, Link, Radio, Spinner, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'
import { ManageVaultFormEditing } from './ManageVaultFormEditing'

function ManageVaultDetails(props: ManageVaultState) {
  const {
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
    liquidationRatio,
    ilk,
    id,
  } = props
  const { t } = useTranslation()
  const collRatio = collateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(collateralizationRatio.times(100), { precision: 2 })
  const collRatioColor = collateralizationRatio.isZero()
    ? 'primary'
    : collateralizationRatio.lte(liquidationRatio.times(1.2))
    ? 'onError'
    : 'onSuccess'

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const liqPrice = formatAmount(liquidationPrice, 'USD')
  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const locked = formatAmount(lockedCollateral, token)
  const lockedUSD = formatAmount(lockedCollateralPrice, token)

  const tokenInfo = getToken(token)

  const newPriceIn = moment(dateNextCollateralPrice).diff(Date.now(), 'minutes')
  const nextPriceDiff = nextCollateralPrice
    ? nextCollateralPrice.minus(currentCollateralPrice).div(nextCollateralPrice).times(100)
    : zero

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
          <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
          <Text>{t('vault.header', { ilk, id })}</Text>
        </Flex>
      </Heading>
      <Box sx={{ mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.liquidation-price')}
        </Heading>
        <Text variant="display">${liqPrice}</Text>
        <Text>
          {t('after')}: ${afterLiqPrice}
        </Text>
      </Box>
      <Box sx={{ textAlign: 'right', mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateralization-ratio')}
        </Heading>
        <Text sx={{ color: collRatioColor }} variant="display">
          {collRatio}
        </Text>
        <Text>
          {t('after')}: {afterCollRatio}
        </Text>
      </Box>
      {isStaticCollateralPrice ? (
        <Box sx={{ mt: 6 }}>
          <Heading variant="subheader" as="h2">{`${token}/USD price`}</Heading>
          <Text variant="header2">${formatAmount(currentCollateralPrice, 'USD')}</Text>
        </Box>
      ) : (
        <Box sx={{ mt: 6 }}>
          <Box>
            <Heading variant="subheader" as="h2">{`Current ${token}/USD price`}</Heading>
            <Text variant="header2" sx={{ py: 3 }}>
              ${formatAmount(currentCollateralPrice, 'USD')}
            </Text>
          </Box>

          {nextCollateralPrice && (
            <Flex sx={{ alignItems: 'flex-start' }}>
              <Heading variant="subheader" as="h3">
                <Box sx={{ mr: 2 }}>
                  {newPriceIn < 2 ? (
                    <Trans
                      i18nKey="vault.next-price-any-time"
                      count={newPriceIn}
                      components={[<br />]}
                    />
                  ) : (
                    <Trans i18nKey="vault.next-price" count={newPriceIn} components={[<br />]} />
                  )}
                </Box>
              </Heading>
              <Flex
                variant="paragraph2"
                sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
              >
                <Text>${formatAmount(nextCollateralPrice || zero, 'USD')}</Text>
                <Text sx={{ ml: 2 }}>({formatPercent(nextPriceDiff, { precision: 2 })})</Text>
                {nextPriceDiff.isZero() ? null : (
                  <Icon sx={{ ml: 2 }} name={nextPriceDiff.gt(zero) ? 'increase' : 'decrease'} />
                )}
              </Flex>
            </Flex>
          )}
        </Box>
      )}
      <Box sx={{ textAlign: 'right', mt: 6 }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateral-locked')}
        </Heading>
        <Text variant="header2" sx={{ py: 3 }}>
          {locked} {token}
        </Text>
        <Text>$ {lockedUSD}</Text>
      </Box>
      <VaultDetails {...props} />
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
  errorMessages,
  depositAmount,
  updateCollateralAllowanceAmount,
  setCollateralAllowanceAmountUnlimited,
  setCollateralAllowanceAmountToDepositAmount,
  resetCollateralAllowanceAmount,
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

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      setCollateralAllowanceAmountUnlimited!()
    }
  }

  function handleDeposit() {
    if (canSelectRadio) {
      setIsCustom(false)
      setCollateralAllowanceAmountToDepositAmount!()
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      resetCollateralAllowanceAmount!()
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
                onChange={handleNumericInput(updateCollateralAllowanceAmount!)}
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
  errorMessages,
  paybackAmount,
  updateDaiAllowanceAmount,
  setDaiAllowanceAmountUnlimited,
  setDaiAllowanceAmountToPaybackAmount,
  resetDaiAllowanceAmount,
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

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      setDaiAllowanceAmountUnlimited!()
    }
  }

  function handlePayback() {
    if (canSelectRadio) {
      setIsCustom(false)
      setDaiAllowanceAmountToPaybackAmount!()
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      resetDaiAllowanceAmount!()
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
                onChange={handleNumericInput(updateDaiAllowanceAmount!)}
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
    toggleIlkDetails,
    showIlkDetails,
  } = props

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && !showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Card>
        <ManageVaultFormHeader {...props} />
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
    <Box sx={{ gridColumn: '1/3', mt: 6 }}>
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
    </Grid>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$ } = useAppContext()
  const manageVault = useObservable(manageVault$(id))
  if (!manageVault) return null

  return (
    <Grid gap={4}>
      <ManageVaultContainer {...manageVault} />
    </Grid>
  )
}
