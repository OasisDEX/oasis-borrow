import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Spinner, Text, Link } from 'theme-ui'
import { ManualChange, OpenVaultState } from './openVault'

function OpenVaultDetails() {
  return (
    <Grid columns="1fr 1fr" gap={6} sx={{ justifyContent: 'space-between' }}>
      <Grid>
        <Text>Liquidation Price</Text>
        <Heading>$1425.20</Heading>
        <Text>After: $2500.20</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateralization Ratio</Text>
        <Heading>200.00%</Heading>
        <Text>After: 300.00%</Text>
      </Grid>

      <Grid>
        <Text>Current ETH/USD Price in 9 mins</Text>
        <Heading>$1375.0000</Heading>
        <Text>Next price: $1325.0000 (-2.30%)</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateral Locked</Text>
        <Heading>200.00 ETH</Heading>
        <Text>$182,000.20 USD</Text>
      </Grid>
    </Grid>
  )
}

function OpenVaultGasSelection() {
  return null
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
    messages,
    ilkDebtAvailable,
    liquidationRatio,
    collateralizationRatio,
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
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  const errorString = messages
    ?.map((message) => message.kind)
    .filter((x) => x)
    .join(',\n')

  const hasError = !!errorString
  const daiAvailable = ilkDebtAvailable ? `${formatCryptoBalance(ilkDebtAvailable)} DAI` : '--'
  const minCollRatio = liquidationRatio
    ? `${formatPercent(liquidationRatio.times(100), { precision: 2 })}`
    : '--'
  const collRatio = collateralizationRatio
    ? `${formatPercent(collateralizationRatio.times(100), { precision: 2 })}`
    : '--'

  return (
    <Grid>
      <VaultActionInput
        action="Deposit"
        amount={depositAmount}
        balance={collateralBalance}
        token={token}
        hasError={false}
        showMax={token !== 'ETH'}
        onSetMax={handleDepositMax(change!)}
        onChange={handleDepositChange(change!)}
      />
      <VaultActionInput
        action="Generate"
        amount={generateAmount}
        token={'DAI'}
        showMax={!!maxGenerateAmount?.gt(zero)}
        onSetMax={handleGenerateMax(change!)}
        hasError={false}
        onChange={handleGenerateChange(change!)}
      />
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap' }}>{errorString}</Text>
        </>
      )}

      <Card>
        <Grid columns="5fr 3fr">
          <Text sx={{ fontSize: 2 }}>Dai Available</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{daiAvailable}</Text>

          <Text sx={{ fontSize: 2 }}>Min. collateral ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{minCollRatio}</Text>

          <Text sx={{ fontSize: 2 }}>Collateralization Ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{collRatio}</Text>
        </Grid>
      </Card>
      <Button onClick={handleProgress}>Confirm</Button>
    </Grid>
  )
}

function OpenVaultFormProxy(props: OpenVaultState) {
  const { stage, proxyConfirmations, safeConfirmations, proxyTxHash, etherscan, progress } = props

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
                {proxyConfirmations ? proxyConfirmations : 0} of {safeConfirmations}: Proxy
                deployment confirming
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

function OpenVaultForm(props: OpenVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Box>
      <Card>
        <OpenVaultFormTitle {...props} />
        {isEditingStage && <OpenVaultFormEditing {...props} />}
        {isProxyStage && <OpenVaultFormProxy {...props} />}
        {isAllowanceStage}
        {isOpenStage}
      </Card>
    </Box>
  )
}

function OpenVaultContainer(props: OpenVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <OpenVaultDetails />
      <OpenVaultForm {...props} />
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const openVault = useObservable(openVault$(ilk))

  if (!openVault) {
    return null
  }

  if (openVault.isIlkValidationStage) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        {openVault.stage === 'ilkValidationLoading' && <Spinner size={50} />}
        {openVault.stage === 'ilkValidationFailure' && (
          <Box>
            Ilk {ilk} does not exist, please update the ilk registry if passed by governance
          </Box>
        )}
      </Grid>
    )
  }

  return (
    <Grid>
      <OpenVaultContainer {...openVault} />
    </Grid>
  )
}
