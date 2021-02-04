import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { ModalProps } from 'helpers/modalHook'
import { ModalBottom } from 'components/Modal'
import { ManualChange, OpenVaultState } from './openVault'
import { Box, Button, Flex, Grid, Heading, Spinner, Text } from 'theme-ui'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { BigNumber } from 'bignumber.js'
import { InputWithMax } from 'helpers/input'
import { getToken } from 'blockchain/tokensMetadata'
import { zero } from 'helpers/zero'
import { formatPercent } from 'helpers/formatters/format'

interface OpenVaultWrapperProps extends WithChildren {
  title: string
  step: number
  steps: number
}

function OpenVaultWrapper({ children, title, step, steps }: OpenVaultWrapperProps) {
  return (
    <Box sx={{ mt: 4, mx: 'auto', width: '100%' }}>
      <Grid gap={4}>
        <Grid columns={steps} sx={{ width: `calc(${steps} * 80px)`, mx: 'auto' }}>
          {[...Array(steps).keys()].map((i) => (
            <Box
              key={i}
              sx={{
                bg: (steps === 3 ? step === i : step - 1 === i) ? 'primary' : 'muted',
                height: 1,
                borderRadius: 'small',
              }}
            />
          ))}
        </Grid>
        <Heading variant="mediumHeading" as="h2" sx={{ textAlign: 'center' }}>
          {title}
        </Heading>
        {children}
      </Grid>
    </Box>
  )
}

function OpenVaultTransactionFlow({ stage, steps }: OpenVaultState & { steps: number }) {
  return (
    <OpenVaultWrapper title={stage} step={2} steps={steps}>
      {stage === 'transactionWaitingForConfirmation'}
    </OpenVaultWrapper>
  )
}

function ProxyAllowanceFlow({
  stage,
  createProxy,
  steps,
  tryAgain,
  token,
  setAllowance,
}: OpenVaultState & { steps: number }) {
  function handleProxyCreate(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    createProxy!()
  }

  function handleRetry(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    tryAgain!()
  }

  function handleSetAllowance(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    setAllowance!()
  }

  const disableProxyButton = stage !== 'proxyWaitingForConfirmation'

  return (
    <OpenVaultWrapper title={stage} step={1} steps={steps}>
      <Grid p={5} sx={{ justifyContent: 'center' }}>
        {(stage === 'proxyWaitingForApproval' || stage === 'proxyInProgress') && <Spinner />}
        {(stage === 'proxyFiasco' || stage === 'allowanceFiasco') && (
          <Box>
            <Text>Proxy Failed :(</Text>
            <Button onClick={handleRetry}>Try Again!</Button>
          </Box>
        )}
        {stage === 'allowanceWaitingForConfirmation' && (
          <Button onClick={handleSetAllowance}>Set Allowance for {token}</Button>
        )}
        {(stage === 'allowanceWaitingForApproval' || stage === 'allowanceInProgress') && (
          <Spinner />
        )}

        <Button
          onClick={handleProxyCreate!}
          disabled={disableProxyButton}
          sx={{ width: 6 }}
        ></Button>
      </Grid>
    </OpenVaultWrapper>
  )
}

function EditVault({
  stage,
  steps,
  lockAmount,
  maxLockAmount,
  drawAmount,
  maxDrawAmount,
  price,
  ilkData: { debtCeiling, debtFloor, ilkDebt, ilkDebtAvailable, ilk, maxDebtPerUnitCollateral },
  token,
  messages,
  change,
  balance,
  proceed,
}: OpenVaultState & { steps: number }) {
  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const lockAmount =
        value !== '' && !new BigNumber(value).eq(zero) ? new BigNumber(value) : undefined
      const maxDrawAmount = lockAmount?.times(maxDebtPerUnitCollateral)

      change({
        kind: 'lockAmount',
        lockAmount,
      })
      change({
        kind: 'maxDrawAmount',
        maxDrawAmount,
      })
      if (!lockAmount) {
        change({ kind: 'drawAmount', drawAmount: undefined })
      }
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'drawAmount',
        drawAmount: value === '' ? undefined : new BigNumber(value),
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'lockAmount', lockAmount: maxLockAmount })
      change({
        kind: 'maxDrawAmount',
        maxDrawAmount: maxLockAmount?.times(maxDebtPerUnitCollateral),
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'drawAmount', drawAmount: maxDrawAmount })
    }
  }

  const errorString = messages
    .map((message) => message.kind)
    .filter((x) => x)
    .join(',\n')

  const hasError = !!errorString

  const canDepositMax = !!maxLockAmount
  const canGenerateMax = !!maxDrawAmount

  const collateralizationRatio =
    drawAmount && lockAmount && !drawAmount.eq(zero) && !lockAmount.eq(zero)
      ? lockAmount.times(price).div(drawAmount).times(100)
      : undefined

  return (
    <OpenVaultWrapper title={stage} step={0} steps={steps}>
      <Grid px={3} py={4} sx={{ justifyContent: 'center', justifyItems: 'center' }}>
        <Grid columns={'2fr 3fr'} sx={{ justifyItems: 'left' }}>
          <Text>Price</Text>
          <Text>
            {price.toString()} {token}/USD
          </Text>

          <Text>Balance</Text>
          <Text>
            {balance.toString()} {token}
          </Text>

          <Text>Deposit {token}</Text>
          <InputWithMax
            {...{
              amount: lockAmount,
              token: getToken(token),
              disabledMax: !canDepositMax,
              hasError,
              onChange: handleDepositChange(change!),
              onSetMax: handleDepositMax(change!),
            }}
          />

          <Text>Generate Dai</Text>
          <InputWithMax
            {...{
              amount: drawAmount,
              token: getToken('DAI'),
              disabledMax: !canGenerateMax,
              hasError,
              onChange: handleGenerateChange(change!),
              onSetMax: handleGenerateMax(change!),
            }}
          />

          <Text>Collateralization Ratio</Text>
          <Text>
            {collateralizationRatio
              ? formatPercent(collateralizationRatio, { precision: 4 })
              : '--'}
          </Text>

          <Text>{ilk} Debt Floor</Text>
          <Text>{debtFloor.toString()} DAI</Text>

          <Text>{ilk} Debt Ceiling</Text>
          <Text>{debtCeiling.toString()} DAI</Text>

          <Text>{ilk} Debt issued</Text>
          <Text>{ilkDebt.toString()} DAI</Text>

          <Text>{ilk} Debt available</Text>
          <Text>{ilkDebtAvailable.toString()} DAI</Text>

          {hasError && (
            <>
              <Text>Errors</Text>
              <Text sx={{ flexWrap: 'wrap' }}>{errorString}</Text>
            </>
          )}
        </Grid>
        <Box mt={4}>
          <Button onClick={proceed!} disabled={hasError} sx={{ width: 6 }}>
            Proceed
          </Button>
        </Box>
      </Grid>
    </OpenVaultWrapper>
  )
}

function OpenVaultView(props: OpenVaultState & { steps: number }) {
  switch (props.stage) {
    case 'editing':
      return EditVault(props)
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFiasco':
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFiasco':
      return ProxyAllowanceFlow(props)
    case 'transactionWaitingForConfirmation':
    case 'transactionWaitingForApproval':
    case 'transactionInProgress':
    case 'transactionFiasco':
    case 'transactionSuccess':
      return OpenVaultTransactionFlow(props)
    default:
      return null
  }
}

export function OpenVaultModal({ ilk, close }: ModalProps) {
  const { openVault$ } = useAppContext()
  const openVault = useObservable(openVault$(ilk))
  /* const [steps, setSteps] = useState<number | undefined>(undefined)

   * useEffect(() => {
   *   if (openVault && !steps) {
   *     const flowSteps = openVault.proxyAddress && openVault.allowance ? 2 : 3
   *     setSteps(flowSteps)
   *   }
   * }, [openVault])
   */
  if (!openVault) {
    return null
  }

  return (
    <ModalBottom {...{ close }}>
      <OpenVaultView {...{ ...openVault, steps: 3 }} />
    </ModalBottom>
  )
}
