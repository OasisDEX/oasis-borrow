import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Box, Card, Grid, Heading, Spinner, Text } from 'theme-ui'
import { OpenVaultState } from './openVault'

function NewVaultDetails({}: any) {
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

function OpenVaultCard({}: OpenVaultState) {
  return <Card>Vault Creation modal</Card>
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const openVault = useObservable(openVault$(ilk))

  if (!openVault) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Spinner size={50} />
      </Grid>
    )
  }

  if (!openVault.isValidIlk) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Box>Ilk {ilk} does not exist, please update the ilk registry if passed by governance</Box>
      </Grid>
    )
  }

  return (
    <Grid columns="2fr 1fr" gap={5} sx={{ width: '100%' }}>
      <NewVaultDetails />
      <OpenVaultCard {...openVault} />
    </Grid>
  )
}
