import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { getToken } from 'components/blockchain/config'
import { CreateVaultView } from 'features/createVault/CreateVaultView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import React, { ReactNode } from 'react'
import { Box, Button, Container, SxStyleProp } from 'theme-ui'

function Table({
  header,
  children,
  sx,
}: React.PropsWithChildren<{ header: ReactNode; sx?: SxStyleProp }>) {
  return (
    <Container
      sx={{ border: '1px solid #D8DFE3', borderCollapse: 'collapse', p: 0, ...sx }}
      as="table"
    >
      <Box as="thead">
        <Box as="tr">{header}</Box>
      </Box>
      <Box as="tbody">{children}</Box>
    </Container>
  )
}

Table.Row = function ({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box sx={{ borderBottom: '1px solid #D8DFE3', ...sx }} as="tr">
      {children}
    </Box>
  )
}

Table.Cell = function ({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box sx={{ px: 3, ...sx }} as="td">
      {children}
    </Box>
  )
}

Table.Header = function ({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box sx={{ px: 3, lineHeight: 4, borderBottom: '1px solid #D8DFE3', ...sx }} as="th">
      {children}
    </Box>
  )
}

function TokenSymbol({ token }: { token: string }) {
  const tokenInfo = getToken(token)

  return (
    <Box>
      <Icon name={tokenInfo.icon} size="20px" sx={{ verticalAlign: 'sub' }} />
      {token}
    </Box>
  )
}

export function LandingView() {
  const { landing$, vaultCreation$, context$ } = useAppContext()
  const landing = useObservable(landing$)
  const context = useObservable(context$)
  const openModal = useModal()

  if (landing === undefined) {
    return null
  }

  function handleVaultOpen(ilk: string) {
    return (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault()
      openModal(CreateVaultView, { ilk })
    }
  }

  const canOpenVault = context?.status === 'connected'

  return (
    <Container>
      <Table
        header={
          <>
            <Table.Header sx={{ textAlign: 'left' }}>Asset</Table.Header>
            <Table.Header sx={{ textAlign: 'left' }}>Type</Table.Header>
            <Table.Header sx={{ textAlign: 'right' }}>DAI Available</Table.Header>
            <Table.Header sx={{ textAlign: 'right' }}>Stability Fee</Table.Header>
            <Table.Header sx={{ textAlign: 'right' }}>Min. Coll Ratio</Table.Header>
            <Table.Header></Table.Header>
          </>
        }
      >
        {landing.rows.map((ilk) => (
          <Table.Row sx={{ td: { py: 2 } }}>
            <Table.Cell>
              <TokenSymbol token={ilk.token} />
            </Table.Cell>
            <Table.Cell>{ilk.ilk}</Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>
              {formatCryptoBalance(ilk.daiAvailable)}
            </Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>{formatPercent(ilk.stabilityFee)}</Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>
              {formatPercent(ilk.liquidationRatio)}
            </Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>
              <Button variant="outline" disabled={!canOpenVault} onClick={handleVaultOpen(ilk.ilk)}>
                Open Vault
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </Container>
  )
}
