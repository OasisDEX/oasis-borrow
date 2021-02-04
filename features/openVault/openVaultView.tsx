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

function OpenVaultTransactionFlow() {
  return <Box>{null}</Box>
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

  return (
    <OpenVaultWrapper title={stage} step={1} steps={steps}>
      <Flex p={5} sx={{ justifyContent: 'center' }}>
        {stage === 'proxyWaitingForConfirmation' && (
          <Button onClick={handleProxyCreate}>Create Proxy</Button>
        )}
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
      </Flex>
    </OpenVaultWrapper>
  )
}

function handleAmountChange(kind: 'lockAmount' | 'drawAmount', change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')

    change({
      kind,
      [kind]: value === '' ? undefined : new BigNumber(value),
    })
  }
}

function EditVault({
  stage,
  steps,
  lockAmount,
  maxLockAmount,
  price,
  drawAmount,
  maxDrawAmount,
  token,
  messages,
  change,
  balance,
}: OpenVaultState & { steps: number }) {
  const hasError = !!messages.length

  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')

      const valueBn = new BigNumber(value)
      change({
        kind: 'lockAmount',
        lockAmount: value === '' ? undefined : valueBn,
      })
      if (value === '' || valueBn.eq(0)) {
        change({ kind: 'drawAmount', drawAmount: undefined })
      }
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')

      const valueBn = new BigNumber(value)
      change({
        kind: 'drawAmount',
        drawAmount: value === '' ? undefined : valueBn,
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'lockAmount', lockAmount: maxLockAmount })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'drawAmount', drawAmount: maxDrawAmount })
    }
  }

  const canDepositMax = !!maxLockAmount
  const canGenerateMax = !!maxDrawAmount

  return (
    <OpenVaultWrapper title={stage} step={0} steps={steps}>
      <Flex p={5} sx={{ justifyContent: 'center' }}>
        <Grid>
          <Box>
            <Text>Deposit {token}</Text>
            <InputWithMax
              {...{
                amount: lockAmount,
                token: getToken(token),
                disabled: !canDepositMax,
                hasError,
                onChange: handleDepositChange(change!),
                onSetMax: handleDepositMax(change!),
              }}
            />
          </Box>
          <Box>
            <Text>Generate Dai</Text>
            <InputWithMax
              {...{
                amount: drawAmount,
                token: getToken(token),
                disabled: !canGenerateMax,
                hasError,
                onChange: handleGenerateChange(change!),
                onSetMax: handleGenerateMax(change!),
              }}
            />
          </Box>
          <Grid columns={'1fr 1fr'}>
            <Text>Price</Text>
            <Text>
              {price.toFixed()} {token}/USD
            </Text>

            <Text>Balance</Text>
            <Text>
              {balance.toFixed()} {token}
            </Text>
          </Grid>
        </Grid>
      </Flex>
    </OpenVaultWrapper>
  )
}

function OpenVaultView(props: OpenVaultState & { steps: number }) {
  switch (props.stage) {
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFiasco':
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFiasco':
      return ProxyAllowanceFlow(props)
    case 'editing':
      return EditVault(props)
    case 'transactionWaitingForConfirmation':
    case 'transactionWaitingForApproval':
    case 'transactionInProgress':
    case 'transactionFiasco':
    case 'transactionSuccess':
      return OpenVaultTransactionFlow()
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
