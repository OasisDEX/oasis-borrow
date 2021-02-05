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

function OpenVaultTransactionFlow({ stage }: OpenVaultState) {
  return null
}

function ProxyAllowanceFlow({
  stage,
  createProxy,
  tryAgain,
  token,
  proceed,
  setAllowance,
  proxyConfirmations,
  safeConfirmations,
}: OpenVaultState) {
  function handleProxyAction(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    if (stage === 'proxyWaitingForConfirmation') createProxy!()
    if (stage === 'proxyFiasco') tryAgain!()
  }

  function handleAllowanceAction(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    if (stage === 'allowanceWaitingForConfirmation') setAllowance!()
    if (stage === 'allowanceFiasco') tryAgain!()
  }

  const canProxyAction = stage === 'proxyWaitingForConfirmation' || stage === 'proxyFiasco'
  const canAllowanceAction =
    stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFiasco'

  const proxyButtonContent =
    stage === 'proxyWaitingForConfirmation' ? (
      'Create Proxy'
    ) : stage === 'proxyWaitingForApproval' || stage === 'proxyInProgress' ? (
      !proxyConfirmations ? (
        <Spinner size={25} />
      ) : (
        `Confirmations: ${proxyConfirmations} / ${safeConfirmations}`
      )
    ) : stage === 'proxyFiasco' ? (
      'Retry'
    ) : (
      ':)'
    )
  const allowanceButtonContent =
    stage === 'proxyWaitingForConfirmation' ||
    stage === 'proxyWaitingForApproval' ||
    stage === 'proxyInProgress' ||
    stage === 'proxyFiasco' ||
    stage === 'allowanceWaitingForConfirmation' ? (
      `Set ${token} Allowance`
    ) : stage === 'allowanceWaitingForApproval' || stage === 'allowanceInProgress' ? (
      <Spinner size={25} />
    ) : stage === 'allowanceFiasco' ? (
      'Retry'
    ) : (
      ':)'
    )

  const canProceed = stage === 'allowanceWaitToContinue'

  return (
    <Grid px={3} py={4} sx={{ justifyContent: 'center', justifyItems: 'center' }}>
      <Grid p={5} columns={'1fr 1fr'} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text>Set ProxyAddress</Text>
        <Button onClick={handleProxyAction!} disabled={!canProxyAction} sx={{ width: 7 }}>
          {proxyButtonContent}
        </Button>

        <Text>Set Allowance</Text>
        {token === 'ETH' ? (
          <Button disabled={true} sx={{ width: 7 }}>
            :)
          </Button>
        ) : (
          <Button onClick={handleAllowanceAction!} disabled={!canAllowanceAction} sx={{ width: 7 }}>
            {allowanceButtonContent}
          </Button>
        )}
      </Grid>

      <Box mt={4}>
        <Button onClick={proceed!} disabled={!canProceed} sx={{ width: 6 }}>
          Proceed
        </Button>
      </Box>
    </Grid>
  )
}

function EditVault({
  lockAmount,
  maxLockAmount,
  drawAmount,
  maxDrawAmount,
  price,
  token,
  messages,
  change,
  balance,
  proceed,
  ilkData,
}: OpenVaultState) {
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

  const {
    debtCeiling,
    debtFloor,
    ilkDebt,
    ilkDebtAvailable,
    ilk,
    maxDebtPerUnitCollateral,
  } = ilkData!
  const errorString = messages
    .map((message) => message.kind)
    .filter((x) => x)
    .join(',\n')

  const hasError = !!errorString

  const canDepositMax = !!maxLockAmount
  const canGenerateMax = !!maxDrawAmount

  const collateralizationRatio =
    drawAmount && lockAmount && price && !drawAmount.eq(zero) && !lockAmount.eq(zero)
      ? lockAmount.times(price).div(drawAmount).times(100)
      : undefined

  return (
    <Grid px={3} py={4} sx={{ justifyContent: 'center', justifyItems: 'center' }}>
      <Grid columns={'2fr 3fr'} sx={{ justifyItems: 'left' }}>
        <Text>Price</Text>
        <Text>
          {price?.toString()} {token}/USD
        </Text>

        <Text>Balance</Text>
        <Text>
          {balance?.toString()} {token}
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
          {collateralizationRatio ? formatPercent(collateralizationRatio, { precision: 4 }) : '--'}
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
  )
}

function OpenVaultView(props: OpenVaultState & { steps: number }) {
  switch (props.stage) {
    case 'editing':
      return (
        <OpenVaultWrapper title={props.stage} step={0} steps={props.steps}>
          <EditVault {...props} />
        </OpenVaultWrapper>
      )
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFiasco':
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFiasco':
    case 'allowanceWaitToContinue':
      return (
        <OpenVaultWrapper title={props.stage} step={1} steps={props.steps}>
          <ProxyAllowanceFlow {...props} />
        </OpenVaultWrapper>
      )
    case 'transactionWaitingForConfirmation':
    case 'transactionWaitingForApproval':
    case 'transactionInProgress':
    case 'transactionFiasco':
    case 'transactionSuccess':
      return (
        <OpenVaultWrapper title={props.stage} step={2} steps={props.steps}>
          <OpenVaultTransactionFlow {...props} />
        </OpenVaultWrapper>
      )
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
