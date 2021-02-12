import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { FeaturedIlks } from 'features/vaultsOverview/VaultsOverviewView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import React, { ReactNode } from 'react'
import { Box, Button, Container, Grid, Heading, SxStyleProp, Text } from 'theme-ui'

export function Table({
  header,
  children,
  sx,
}: React.PropsWithChildren<{ header: ReactNode; sx?: SxStyleProp }>) {
  return (
    <Container
      sx={{
        p: 0,
        borderCollapse: 'separate',
        borderSpacing: '0 9px',
        ...sx,
      }}
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
    <Box
      sx={{
        boxShadow: 'table',
        background: 'white',
        borderRadius: '8px',
        ...sx,
      }}
      as="tr"
    >
      {children}
    </Box>
  )
}

Table.Cell = function ({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      sx={{
        p: 3,
        ':first-child': {
          borderRadius: '8px 0 0 8px',
        },
        ':last-child': {
          borderRadius: '0 8px 8px 0',
        },
        ...sx,
      }}
      as="td"
    >
      {children}
    </Box>
  )
}

Table.Header = function ({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      sx={{
        px: 3,
        color: 'text.muted',
        fontSize: 2,
        textAlign: 'left',
        ...sx,
      }}
      as="th"
    >
      {children}
    </Box>
  )
}

export function TokenSymbol({ token }: { token: string }) {
  const tokenInfo = getToken(token)

  return (
    <Box>
      <Icon name={tokenInfo.icon} size="20px" sx={{ verticalAlign: 'sub', mr: 2 }} />
      {token}
    </Box>
  )
}

export function LandingView() {
  const { landing$ } = useAppContext()
  const landing = useObservable(landing$)

  if (landing === undefined) {
    return null
  }

  return (
    <Grid sx={{ flex: 1 }}>
      <Box sx={{ width: '600px', justifySelf: 'center', textAlign: 'center', my: 4 }}>
        <Heading sx={{ fontSize: 7, my: 3 }}>
          Borrow against your <br /> collateral by generating Dai
        </Heading>
        <Text>Realize liquidity today and don't lose long exposure.</Text>
      </Box>
      <Box sx={{ my: 4 }}>
        <FeaturedIlks ilks={landing.featuredIlks} />
      </Box>
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
        {landing.rows.map(({ token, ilk, ilkDebtAvailable, stabilityFee, liquidationRatio }) => (
          <Table.Row key={ilk} sx={{ td: { py: 2 } }}>
            <Table.Cell>
              <TokenSymbol token={token} />
            </Table.Cell>
            <Table.Cell>{ilk}</Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>
              {formatCryptoBalance(ilkDebtAvailable)}
            </Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee)}</Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio)}</Table.Cell>
            <Table.Cell sx={{ textAlign: 'right' }}>
              <AppLink href={`/vaults/open/${ilk}`} variant="secondary">
                Open Vault
              </AppLink>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </Grid>
  )
}
