import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { Trans, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Card, Flex, Grid, Heading, Label, Link, Radio, Spinner, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

function OpenVaultDetails(props: OpenVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    token,

    currentCollateralPrice,
    nextCollateralPrice,
    isStaticCollateralPrice,
    dateNextCollateralPrice,
    ilk,
  } = props

  const { t } = useTranslation()

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

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
          <Text>{t('vault.open-vault', { ilk })}</Text>
        </Flex>
      </Heading>

      <Box sx={{ mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.liquidation-price')}
        </Heading>
        <Text variant="display">$0.00</Text>
        <Text>
          <Text>{t('vaults.after', { price: afterLiqPrice })}</Text>
        </Text>
      </Box>

      <Box sx={{ textAlign: 'right', mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateralization-ratio')}
        </Heading>
        <Text variant="display">{afterCollRatio}</Text>
      </Box>

      {isStaticCollateralPrice ? (
        <Box sx={{ mt: 6 }}>
          <Heading variant="subheader" as="h2">
            {t('vaults.current-price', { token })}
          </Heading>
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
                    <Trans i18nKey="next-price-any-time" count={newPriceIn} components={[<br />]} />
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
          00.00 {token}
        </Text>
        <Text>$ 00.00</Text>
      </Box>
      <VaultDetails {...props} />
    </Grid>
  )
}

function VaultDetails(props: OpenVaultState) {
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
              0.00
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
              0.00
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
          <Box variant="text.header3">0%</Box>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.liquidation-penalty')}
          </Box>
          <Box variant="text.header3">0%</Box>
        </Box>
      </Grid>
    </Box>
  )
}

function OpenVaultFormTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  reset,
  stage,
}: OpenVaultState) {
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
            ? 'Configure your Vault'
            : isProxyStage
            ? 'Create Proxy'
            : isAllowanceStage
            ? 'Set Allowance'
            : 'Create your Vault'}
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

function OpenVaultFormEditing(props: OpenVaultState) {
  const {
    token,
    depositAmount,
    generateAmount,
    change,
    collateralBalance,
    maxDepositAmount,
    maxGenerateAmount,
    errorMessages,
    warningMessages,
    ilkDebtAvailable,
    liquidationRatio,
    afterCollateralizationRatio,
    progress,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined

      change({
        kind: 'depositAmount',
        depositAmount,
      })
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      change({
        kind: 'depositAmount',
        depositAmount: maxDepositAmount.gt(zero) ? maxDepositAmount : undefined,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({
        kind: 'generateAmount',
        generateAmount: maxGenerateAmount.gt(zero) ? maxGenerateAmount : undefined,
      })
    }
  }

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
        amount={depositAmount}
        onChange={handleDepositChange(change!)}
        showMax={true}
        onSetMax={handleDepositMax(change!)}
        maxAmount={collateralBalance}
        maxAmountLabel={'Balance'}
        hasError={hasError}
      />
      <VaultActionInput
        action="Generate"
        token={'DAI'}
        amount={generateAmount}
        onChange={handleGenerateChange(change!)}
        showMax={true}
        onSetMax={handleGenerateMax(change!)}
        maxAmount={maxGenerateAmount}
        hasError={hasError}
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
          <Text sx={{ fontSize: 2 }}>Dai Available</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{daiAvailable}</Text>

          <Text sx={{ fontSize: 2 }}>Min. collateral ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{minCollRatio}</Text>

          <Text sx={{ fontSize: 2 }}>Collateralization Ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{afterCollRatio}</Text>
        </Grid>
      </Card>
      <Button onClick={handleProgress} disabled={hasError}>
        Confirm
      </Button>
    </Grid>
  )
}

function OpenVaultFormProxy({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
  progress,
}: OpenVaultState) {
  const isLoading = stage === 'proxyInProgress' || stage === 'proxyWaitingForApproval'

  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  const buttonText =
    stage === 'proxySuccess'
      ? 'Continue'
      : stage === 'proxyFailure'
      ? 'Retry Create Proxy'
      : stage === 'proxyWaitingForConfirmation'
      ? 'Create Proxy'
      : 'Creating Proxy'

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
                {proxyConfirmations || 0} of {safeConfirmations}: Proxy deployment confirming
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
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
                {safeConfirmations} of {safeConfirmations}: Proxy deployment confirmed
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function OpenVaultFormAllowance({
  stage,
  allowanceTxHash,
  etherscan,
  progress,
  token,
  collateralBalance,
  allowanceAmount,
  change,
  errorMessages,
}: OpenVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const isLoading = stage === 'allowanceInProgress' || stage === 'allowanceWaitingForApproval'
  const canSelectRadio = stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure'
  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  function handleCustomAllowanceChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'allowanceAmount',
        allowanceAmount: value !== '' ? new BigNumber(value) : undefined,
      })
    }
  }

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'allowanceAmount', allowanceAmount: maxUint256 })
    }
  }

  function handleWallet() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'allowanceAmount', allowanceAmount: collateralBalance })
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      change!({ kind: 'allowanceAmount', allowanceAmount: undefined })
      setIsCustom(true)
    }
  }

  const errorString = errorMessages.join(',\n')

  const hasError = !!errorString
  const buttonText =
    stage === 'allowanceSuccess'
      ? 'Continue'
      : stage === 'allowanceFailure'
      ? 'Retry allowance approval'
      : stage === 'allowanceWaitingForConfirmation'
      ? 'Approve allowance'
      : 'Approving allowance'

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>Unlimited Allowance</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleWallet}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              {token} in wallet ({formatCryptoBalance(collateralBalance)})
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>Custom</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
                disabled={!isCustom}
                value={
                  allowanceAmount && isCustom
                    ? formatAmount(allowanceAmount, getToken(token).symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken(token).digits,
                  prefix: '',
                })}
                onChange={handleCustomAllowanceChange(change!)}
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
      {stage === 'allowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Setting Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${allowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'allowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Set Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${allowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function OpenVaultFormConfirmation({
  stage,
  collateralBalance,
  depositAmount,
  generateAmount,
  token,
  afterCollateralizationRatio,
  afterLiquidationPrice,
  progress,
  id,
  etherscan,
  openTxHash,
}: OpenVaultState) {
  const { replace } = useRedirect()

  const walletBalance = formatCryptoBalance(collateralBalance)
  const intoVault = formatCryptoBalance(depositAmount || zero)
  const remainingInWallet = formatCryptoBalance(
    depositAmount ? collateralBalance.minus(depositAmount) : collateralBalance,
  )
  const daiToBeGenerated = formatCryptoBalance(generateAmount || zero)
  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const canProgress = !!progress || stage === 'openSuccess'
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (progress) progress!()
    if (stage === 'openSuccess') {
      replace(`/${id}`)
    }
  }
  const isLoading = stage === 'openInProgress' || stage === 'openWaitingForApproval'

  const buttonText =
    stage === 'openWaitingForConfirmation'
      ? 'Create your Vault'
      : stage === 'openFailure'
      ? 'Retry'
      : stage === 'openSuccess'
      ? `Open Vault #${id!}`
      : 'Creating your Vault'

  return (
    <Grid>
      <Card backgroundColor="Success">
        <Grid columns="1fr 1fr">
          <Text sx={{ fontSize: 1 }}>In your wallet</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {walletBalance} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Moving into Vault</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {intoVault} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Remaining in Wallet</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {remainingInWallet} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Dai being generated</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiToBeGenerated} DAI</Text>

          <Text sx={{ fontSize: 1 }}>Collateral Ratio</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{afterCollRatio}</Text>

          <Text sx={{ fontSize: 1 }}>Liquidation Price</Text>
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

      {stage === 'openInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Creating your {token} Vault!
              </Text>
              <Link
                href={`${etherscan}/tx/${openTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'openSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Vault #{id} created!
              </Text>
              <Link
                href={`${etherscan}/tx/${openTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Box>
      <Card>
        <OpenVaultFormTitle {...props} />
        {isEditingStage && <OpenVaultFormEditing {...props} />}
        {isProxyStage && <OpenVaultFormProxy {...props} />}
        {isAllowanceStage && <OpenVaultFormAllowance {...props} />}
        {isOpenStage && <OpenVaultFormConfirmation {...props} />}
      </Card>
    </Box>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <OpenVaultDetails {...props} />
      <OpenVaultForm {...props} />
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { t } = useTranslation()
  const { openVault$ } = useAppContext()
  const openVault = useObservable(openVault$(ilk))

  if (!openVault) {
    return <>loading...</>
  }

  if (openVault.isIlkValidationStage) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        {openVault.stage === 'ilkValidationLoading' && <Spinner size={50} />}
        {openVault.stage === 'ilkValidationFailure' && (
          <Box>{t('vaults.ilk-does-not-exist', { ilk })}</Box>
        )}
      </Grid>
    )
  }
  return (
    <Grid>
      <OpenVaultContainer {...(openVault as OpenVaultState)} />
    </Grid>
  )
}
