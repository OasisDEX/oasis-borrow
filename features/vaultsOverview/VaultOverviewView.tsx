import { Context } from 'blockchain/network'
import { VaultOverviewOwnershipNotice } from 'features/notices/VaultsNoticesView'
import { ProductCardData } from 'helpers/productCards'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { AssetsAndPositionsOverview } from './containers/AssetsAndPositionsOverview'
import { Connect } from './containers/Connect'
import { PositionsList } from './containers/PositionsList'
import { VaultSuggestions } from './VaultSuggestions'

interface Props {
  context: Context
  address: string
  ensName: string | null | undefined
  productCardsData: ProductCardData[]
}

export function VaultsOverviewView({ context, address, ensName, productCardsData }: Props) {
  const connectedAccount = context?.status === 'connected' ? context.account : undefined

  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: '39px' }}>
      {connectedAccount && address !== connectedAccount && (
        <VaultOverviewOwnershipNotice account={connectedAccount} controller={address} />
      )}
      <Flex sx={{ mt: 5, flexDirection: 'column' }}>
        <AssetsAndPositionsOverview address={address} />
        <Connect address={address} context={context} />
      </Flex>
      <PositionsList address={address} />

      {isOwnerViewing && (
        <VaultSuggestions productCardsData={productCardsData} address={ensName || address} />
      )}
    </Grid>
  )
}
