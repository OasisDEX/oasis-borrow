import { useAppContext } from 'components/AppContextProvider'
import { PositionList, PositionVM } from 'components/dumb/PositionList'
import { getAddress } from 'ethers/lib/utils'
import { getDsrPosition } from 'features/dsr/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
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
  const { vaultsOverview$, dsr$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))

  // TODO move logic regarding dsr to vaultsOverview$ observable
  const daiSavingsRate = useFeatureToggle('DaiSavingsRate')
  const resolvedDsr$ = dsr$(address)
  const [pots] = useObservable(resolvedDsr$)

  const dsrPosition = daiSavingsRate ? getDsrPosition({ pots, address }) : []

  return (
    <WithErrorHandler error={[vaultsOverviewError]}>
      <WithLoadingIndicator value={[vaultsOverview]}>
        {([{ positions }]) => <PositionsListView positions={[...positions, ...dsrPosition]} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
