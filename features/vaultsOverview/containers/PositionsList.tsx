import { useAppContext } from 'components/AppContextProvider'
import { PositionList, PositionVM } from 'components/dumb/PositionList'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Card } from 'theme-ui'

function PositionsListView({ positions }: { positions: PositionVM[] }) {
  const numberOfVaults = positions.length

  if (numberOfVaults !== 0) {
    return (
      <Card
        variant="positionsPage"
        sx={{
          mb: 4,
        }}
      >
        <PositionList positions={positions} />
      </Card>
    )
  }

  return null
}

export function PositionsList({ address }: { address: string }) {
  const { vaultsOverview$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))

  return (
    <WithErrorHandler error={[vaultsOverviewError]}>
      <WithLoadingIndicator value={[vaultsOverview]}>
        {([{ positions }]) => <PositionsListView positions={positions} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
