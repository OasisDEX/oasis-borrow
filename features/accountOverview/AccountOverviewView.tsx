import { AppLink } from 'components/Links'
import { IlkOverview } from 'features/landing/ilksOverview'
import { Vault } from 'features/vaults/vault'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { Button, Heading } from 'theme-ui'

import { Table, TokenSymbol } from '../landing/LandingView'
import { AccountOverview } from './accountOverview'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  return (
    <Table
      header={
        <>
          <Table.Header>Id</Table.Header>
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
          <Table.Cell>{vault.id}</Table.Cell>
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
export function AccountOverviewView({
  vaults,
  ilksOverview,
  vaultSummary,
}: AccountOverview) {
  return (
    <>
      {vaultSummary && (
        <Heading>Total Dai: {formatCryptoBalance(vaultSummary.totalDaiDebt)}</Heading>
      )}
      {vaultSummary && (
        <Heading>
          Total Collateral price: {formatFiatBalance(vaultSummary.totalCollateralPrice)} USD
        </Heading>
      )}
      <Heading>Your Vaults</Heading>
      {vaults && <VaultsTable vaults={vaults} />}
      <Heading>Vaults</Heading>
      {ilksOverview && <AllIlks ilks={ilksOverview} />}
    </>
  )
}
