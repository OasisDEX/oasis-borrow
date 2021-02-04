import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { IlkOverview } from 'features/landing/ilksOverview'
import { OpenVaultModal } from 'features/openVault/openVaultView'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import React from 'react'
import { Button, Heading } from 'theme-ui'

import { Table, TokenSymbol } from '../landing/LandingView'
import { VaultsOverview } from './vaultsOverview'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  return (
    <Table
      header={
        <>
          <Table.Header>Id</Table.Header>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Deposited</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Avail. to withdraw</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>DAI</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Current Ratio</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {vaults.map((vault) => (
        <Table.Row key={vault.id}>
          <Table.Cell>{vault.id}</Table.Cell>
          <Table.Cell>
            <TokenSymbol token={vault.token} />
          </Table.Cell>
          <Table.Cell>{vault.ilk}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.freeCollateral)} ${
            vault.token
          }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.collateral)} ${
            vault.token
          }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{formatCryptoBalance(vault.debt)}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {vault.collateralizationRatio
              ? formatPercent(vault.collateralizationRatio.times(100))
              : 0}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            <AppLink
              sx={{ lineHeight: 1 }}
              variant="buttons.outline"
              as={`/${vault.id}`}
              href={`/[vault]`}
            >
              Manage Vault
            </AppLink>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
  )
}

function AllIlks({
  canOpenVault,
  ilkDataList,
}: {
  canOpenVault: boolean
  ilkDataList: IlkDataList
}) {
  const openModal = useModal()

  function handleVaultOpen(ilk: string) {
    return (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault()
      openModal(OpenVaultModal, { ilk })
    }
  }

  return (
    <Table
      header={
        <>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>DAI Available</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Stability Fee</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Min. Coll Rato</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {ilkDataList.map(({ ilk, token, ilkDebtAvailable, stabilityFee, liquidationRatio }) => (
        <Table.Row key={ilk}>
          <Table.Cell>
            <TokenSymbol token={token} />
          </Table.Cell>
          <Table.Cell>{ilk}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatCryptoBalance(ilkDebtAvailable)}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatPercent(stabilityFee.times(100))}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatPercent(liquidationRatio.times(100))}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            <Button
              sx={{ lineHeight: 1 }}
              variant="outline"
              disabled={!canOpenVault}
              onClick={handleVaultOpen(ilk)}
            >
              Open Vault
            </Button>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
  )
}

export function VaultsOverviewView({
  canOpenVault,
  vaults,
  ilkDataList,
  vaultSummary,
}: VaultsOverview) {
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
      {ilkDataList && <AllIlks canOpenVault={canOpenVault} ilkDataList={ilkDataList} />}
    </>
  )
}
