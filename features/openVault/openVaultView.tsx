import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { ModalProps } from 'helpers/modalHook'
import { ModalBottom } from 'components/Modal'
import { OpenVaultProxyStage, OpenVaultState } from './openVault'
import { Box, Button, Grid } from 'theme-ui'

function OpenVaultTransactionFlow() {
  return <Box>{null}</Box>
}
function OpenVaultEditingFlow() {
  return <Box>{null}</Box>
}
function OpenVaultAllowanceFlow() {
  return <Box>{null}</Box>
}

interface OpenVaultProxyFlowParams {
  stage: OpenVaultProxyStage
  createProxy: () => void
}

function OpenVaultProxyFlow({ stage, createProxy }: OpenVaultProxyFlowParams) {
  function handleProxyCreate(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault
    createProxy()
  }

  return stage === 'proxyWaitingForConfirmation' ? (
    <Grid sx={{ alignItems: 'center' }}>
      <Box>
        <Button onClick={handleProxyCreate}>Create Proxy</Button>
      </Box>
    </Grid>
  ) : stage === 'proxyWaitingForApproval' ? (
    <Box>{stage}</Box>
  ) : stage === 'proxyInProgress' ? (
    <Box>{stage}</Box>
  ) : (
    <Box>{stage}</Box>
  )
}

function OpenVaultView({ stage, createProxy }: OpenVaultState) {
  switch (stage) {
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFiasco':
      return OpenVaultProxyFlow({
        stage,
        createProxy: createProxy!,
      })
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFiasco':
      return OpenVaultAllowanceFlow()
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

  return openVault ? (
    <ModalBottom {...{ close }}>
      <Grid sx={{ height: '75vh', justifyItems: 'center' }}>
        <OpenVaultView {...openVault} />
      </Grid>
    </ModalBottom>
  ) : null
}
