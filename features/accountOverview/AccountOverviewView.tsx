import { AppLink } from 'components/Links'
import { IlkOverview } from 'features/landing/ilksOverview'
import { Vault } from 'features/vaults/vault'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useRouter } from 'next/router'
import React from 'react'
import { Heading } from 'theme-ui'

import { Table } from '../landing/LandingView'
import { AccountOverview } from './accountOverview'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  const { query } = useRouter()

  return (
    <Table
      header={
        <>
          <Table.Header>Id</Table.Header>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header>Deposited</Table.Header>
          <Table.Header>Avail. to withdraw</Table.Header>
          <Table.Header>DAI</Table.Header>
          <Table.Header>Current Ratio</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {vaults.map((vault) => (
        <Table.Row key={vault.id}>
          <Table.Cell>{vault.id}</Table.Cell>
          <Table.Cell>{vault.token}</Table.Cell>
          <Table.Cell>{vault.ilk}</Table.Cell>
          <Table.Cell>{`${formatCryptoBalance(vault.freeCollateral)} ${vault.token}`}</Table.Cell>
          <Table.Cell>{`${formatCryptoBalance(vault.collateral)} ${vault.token}`}</Table.Cell>
          <Table.Cell>{formatCryptoBalance(vault.debt)}</Table.Cell>
          <Table.Cell>
            {vault.collateralizationRatio
              ? formatPercent(vault.collateralizationRatio.times(100))
              : 0}
          </Table.Cell>
          <Table.Cell sx={{p: 3}}>
            <AppLink variant="buttons.outline" as={`/${vault.id}`} href={`/[vault]`}>
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
          <Table.Header>DAI Available</Table.Header>
          <Table.Header>Stability Fee</Table.Header>
          <Table.Header>Min. Coll Rato</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {ilks.map((vault) => (
        <Table.Row key={vault.ilk}>
          <Table.Cell>{vault.token}</Table.Cell>
          <Table.Cell>{vault.ilk}</Table.Cell>
          <Table.Cell>{formatCryptoBalance(vault.daiAvailable)}</Table.Cell>
          <Table.Cell>{formatPercent(vault.stabilityFee.times(100))}</Table.Cell>
          <Table.Cell>{formatPercent(vault.liquidationRatio.times(100))}</Table.Cell>
          <Table.Cell>Open Vault</Table.Cell>
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
