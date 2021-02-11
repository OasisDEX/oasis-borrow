import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ModalBottom } from 'components/Modal'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { InputWithMax } from 'helpers/input'
import { ModalProps } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Grid, Heading, Spinner, Text } from 'theme-ui'

import { ManualChange, OpenVaultStage, OpenVaultState } from './openVault'

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

function OpenVaultTransactionFlow({
  stage,
  lockAmount,
  token,
  drawAmount,
  back,
  price,
  close,
  openVault,
  tryAgain,
  id,
  closeModal,
}: OpenVaultState & { closeModal: () => void }) {
  const { replace } = useRedirect()

  function handleBackToEdit(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    back!()
  }

  function handleNewVault(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    close!()
    closeModal()
    setTimeout(() => {
      replace(`/${id}`)
    }, 0)
  }

  function handleOpenVault(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (stage === 'transactionWaitingForConfirmation') openVault!()
    if (stage === 'transactionFiasco') tryAgain!()
  }

  const canDoAction = stage === 'transactionWaitingForConfirmation' || stage === 'transactionFiasco'

  const collateralizationRatio =
    drawAmount && lockAmount && price && !drawAmount.eq(zero) && !lockAmount.eq(zero)
      ? lockAmount.times(price).div(drawAmount).times(100)
      : undefined

  const transactionButtonContent =
    stage === 'transactionWaitingForConfirmation' ? (
      'Open Vault'
    ) : stage === 'transactionWaitingForApproval' || stage === 'transactionInProgress' ? (
      <Spinner size={25} />
    ) : (
      'Retry '
    )

  return (
    <Grid px={3} py={4} sx={{ justifyContent: 'center', justifyItems: 'center' }}>
      <Text>Vault Summary</Text>
      <Grid
        p={5}
        gap={4}
        columns={'2fr 1fr 2fr'}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Text>Amount To Lock</Text>
        <Box />
        <Text>
          {formatAmount(lockAmount || zero, token)} {token}
        </Text>

        <Text>Amount To Generate</Text>
        <Box />
        <Text>{formatAmount(drawAmount || zero, 'DAI')} DAI</Text>

        <Text>Collateralization Ratio</Text>
        <Box />
        <Text>
          {collateralizationRatio ? formatPercent(collateralizationRatio, { precision: 4 }) : '--'}
        </Text>
      </Grid>
      {stage === 'transactionSuccess' ? (
        <Grid mt={4} sx={{ justifyContent: 'center' }}>
          <Button onClick={handleNewVault}>{`View Vault #${id}`}</Button>
        </Grid>
      ) : (
        <Grid columns="1fr 1fr" mt={4} sx={{ justifyContent: 'center' }}>
          <Button disabled={!canDoAction} onClick={handleBackToEdit} sx={{ width: 6 }}>
            Edit
          </Button>
          <Button disabled={!canDoAction} onClick={handleOpenVault} sx={{ width: 6 }}>
            {transactionButtonContent}
          </Button>
        </Grid>
      )}
    </Grid>
  )
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

  const isProxyStage = ([
    'proxyWaitingForConfirmation',
    'proxyWaitingForApproval',
    'proxyInProgress',
    'proxyFiasco',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const proxyButtonReady = 'Create Proxy'
  const proxyButtonLoading = <Spinner size={25} />
  const proxyButtonConfirming = `Confirmations: ${proxyConfirmations} / ${safeConfirmations}`
  const proxyButtonFailed = 'Retry'
  const proxyButtonSuccess = 'Success'

  const proxyButtonContent =
    stage === 'proxyWaitingForConfirmation'
      ? proxyButtonReady
      : stage === 'proxyWaitingForApproval' || stage === 'proxyInProgress'
      ? !proxyConfirmations
        ? proxyButtonLoading
        : proxyButtonConfirming
      : stage === 'proxyFiasco'
      ? proxyButtonFailed
      : proxyButtonSuccess

  const allowanceButtonReady = `Set ${token} Allowance`
  const allowanceButtonLoading = <Spinner size={25} />
  const allowanceButtonFailed = 'Retry'
  const allowanceButtonSuccess = 'Success'

  const allowanceButtonContent =
    isProxyStage || stage === 'allowanceWaitingForConfirmation'
      ? allowanceButtonReady
      : stage === 'allowanceWaitingForApproval' || stage === 'allowanceInProgress'
      ? allowanceButtonLoading
      : stage === 'allowanceFiasco'
      ? allowanceButtonFailed
      : allowanceButtonSuccess

  const canProceed = stage === 'waitToContinue'

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
      const lockAmount = value !== '' ? new BigNumber(value) : undefined
      const maxDrawAmount = lockAmount?.times(maxDebtPerUnitCollateral)

      change({
        kind: 'lockAmount',
        lockAmount,
      })
      change({
        kind: 'maxDrawAmount',
        maxDrawAmount,
      })
      if (!lockAmount || new BigNumber(value).eq(zero)) {
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

function OpenVaultView(props: OpenVaultState & { steps: number; closeModal: () => void }) {
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
    case 'waitToContinue':
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

  return <OpenVaultView {...{ ...openVault, steps: 3, closeModal: close }} />
}
