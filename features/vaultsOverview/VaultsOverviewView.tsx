import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { IlkOverview } from 'features/landing/ilksOverview'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { Box, Button, Text, Grid, Heading } from 'theme-ui'

import { Table, TokenSymbol } from '../landing/LandingView'
import { VaultsOverview } from './vaultsOverview'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  return (
    <Table
      header={
        <>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>Deposited</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>Avail. to withdraw</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>DAI</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>Current Ratio</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {vaults.map((vault) => (
        <Table.Row key={vault.id}>
          <Table.Cell><TokenSymbol token={vault.token} /></Table.Cell>
          <Table.Cell>{vault.ilk}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{`${formatCryptoBalance(vault.freeCollateral)} ${vault.token}`}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{`${formatCryptoBalance(vault.collateral)} ${vault.token}`}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{formatCryptoBalance(vault.debt)}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>
            {vault.collateralizationRatio
              ? formatPercent(vault.collateralizationRatio.times(100))
              : 0}
          </Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>
            <AppLink sx={{lineHeight: 1}} variant="buttons.outline" as={`/${vault.id}`} href={`/[vault]`}>
              Manage Vault
            </AppLink>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
  )
}

function AllIlks({ ilks }: { ilks: IlkOverview[] }) {
  return (
    <Table
      header={
        <>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>DAI Available</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>Stability Fee</Table.Header>
          <Table.Header sx={{textAlign: 'right'}}>Min. Coll Rato</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {ilks.map((ilk) => (
        <Table.Row key={ilk.ilk}>
          <Table.Cell><TokenSymbol token={ilk.token} /></Table.Cell>
          <Table.Cell>{ilk.ilk}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{formatCryptoBalance(ilk.daiAvailable)}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{formatPercent(ilk.stabilityFee.times(100))}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>{formatPercent(ilk.liquidationRatio.times(100))}</Table.Cell>
          <Table.Cell sx={{textAlign: 'right'}}>
            <Button sx={{lineHeight: 1}} variant="outline">Open Vault</Button>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
  )
}

interface CallToCationProps {
  heading: string,
  ilk: string,
}
function CallToAction() {
  return (
    <Grid columns="1fr 1fr"  sx={{flex: 1, background: 'linear-gradient(284.73deg, #9658D3 3.42%, #415FFF 97.28%)', borderRadius: 'large', p: 4, color: 'white'}}>
      <Box sx={{gridColumn: '1/3'}}>
        <Text>New</Text>
      </Box>
      <Box sx={{gridColumn: '1/3'}}>
        <Text variant="heading" sx={{color: 'white'}}>ETH</Text>
      </Box>
      <Box>
        <Text variant="boldBody">Stability fee:</Text>
        <Text variant="small">2.50%</Text>
      </Box>
      <Box>
        <Text variant="boldBody">Min coll ratio:</Text>
        <Text variant="small">150%</Text>
      </Box>
    </Grid>
  )
}

export function VaultsOverviewView({
  vaults,
  ilkDataList,
  vaultSummary,
}: VaultsOverview) {
  return (
    <Grid>
      <Heading sx={{textAlign: 'center'}} as="h1">Vault overview</Heading>
      <Grid columns="1fr 1fr 1fr" gap={4}>
        <CallToAction />
        <CallToAction />
        <CallToAction />
      </Grid>
      {/* {vaultSummary && (
        <Heading>Total Dai: {formatCryptoBalance(vaultSummary.totalDaiDebt)}</Heading>
      )}
      {vaultSummary && (
        <Heading>
          Total Collateral price: {formatFiatBalance(vaultSummary.totalCollateralPrice)} USD
        </Heading>
      )} */}
      <Heading>Your Vaults</Heading>
      {vaults && <VaultsTable vaults={vaults} />}
      <Heading>Vaults</Heading>
      {ilkDataList && <AllIlks ilks={ilkDataList} />}
    </Grid>
  )
}
