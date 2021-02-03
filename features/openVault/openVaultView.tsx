import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { ModalProps } from 'helpers/modalHook'
import { ModalBottom } from 'components/Modal'
import { OpenVaultState } from './openVault'
import { Box, Button, Flex, Grid, Heading, Spinner, Text } from 'theme-ui'
import { WithChildren } from 'helpers/types'
import React, { useEffect, useState } from 'react'

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
function OpenVaultEditingFlow() {
  return <Box>{null}</Box>
}

function ProxyAllowanceFlow({
  stage,
  createProxy,
  steps,
  tryAgain,
}: OpenVaultState & { steps: number }) {
  function handleProxyCreate(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    createProxy!()
  }

  function handleProxyFail(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    tryAgain
  }

  return (
    <OpenVaultWrapper title={stage} step={0} steps={steps}>
      <Flex p={5} sx={{ justifyContent: 'center' }}>
        {stage === 'proxyWaitingForConfirmation' && (
          <Button onClick={handleProxyCreate}>Create Proxy</Button>
        )}
        {(stage === 'proxyWaitingForApproval' || stage === 'proxyInProgress') && <Spinner />}
        {stage === 'proxyFiasco' && (
          <Box>
            <Text>Proxy Failed :(</Text>
            <Button onClick={handleProxyFail}>Try Again!</Button>
          </Box>
        )}
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
    case 'editingWaitingToContinue':
    case 'editing':
      return OpenVaultEditingFlow()
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
  const [steps, setSteps] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (openVault && !steps) {
      const flowSteps = openVault.stage === 'editing' ? 2 : 3
      setSteps(flowSteps)
    }
  }, [openVault])

  if (!openVault || !steps) {
    return null
  }

  return (
    <ModalBottom {...{ close }}>
      <OpenVaultView {...{ ...openVault, steps }} />
    </ModalBottom>
  )
}
