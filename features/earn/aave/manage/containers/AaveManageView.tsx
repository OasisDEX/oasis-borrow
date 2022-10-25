import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { AavePositionAlreadyOpenedNotice } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { keyBy } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Observable, of } from 'rxjs'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { AavePositionHeader, AavePositionHeaderWithDetails } from '../../components'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { createAaveUserConfiguration, hasOtherAssets } from '../../helpers/aaveUserConfiguration'
import { SimulateSectionComponent } from '../../open/components'
import { StrategyConfig } from '../../open/containers/AaveOpenView'
import { ManageSectionComponent } from '../components'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { ManageAaveStateMachine } from '../state'
import {
  ManageAaveStateMachineContextProvider,
  useManageAaveStateMachineContext,
} from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
}

function AaveManageContainer({
  manageAaveStateMachine,
  strategyConfig,
  aaveReserveState,
  aaveReserveDataETH,
}: {
  manageAaveStateMachine: ManageAaveStateMachine
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetails
  return (
    <ManageAaveStateMachineContextProvider machine={manageAaveStateMachine}>
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <Header strategyName={strategyConfig.name} noDetails />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'overview',
              label: t('system.overview'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <VaultDetails
                      aaveReserveState={aaveReserveState}
                      aaveReserveDataETH={aaveReserveDataETH}
                    />
                  </Box>
                  <Box>{<SidebarManageAaveVault />}</Box>
                </Grid>
              ),
            },
            {
              value: 'position-info',
              label: t('system.position-info'),
              content: (
                <Card variant="faq">
                  <AaveFaq />
                </Card>
              ),
            },
          ]}
        />
        <Survey for="earn" />
      </Container>
    </ManageAaveStateMachineContextProvider>
  )
}

function AavePositionNotice() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { context } = state
  const { aaveUserConfiguration, aaveReservesList } = context.protocolData || {}
  const hasOtherAssetsThanETH_STETH = hasOtherAssets(
    createAaveUserConfiguration(aaveUserConfiguration, aaveReservesList),
    ['ETH', 'STETH'],
  )

  if (hasOtherAssetsThanETH_STETH) {
    return <AavePositionAlreadyOpenedNotice />
  }
  return null
}

function getAaveStrategy$(_address: string): Observable<StrategyConfig> {
  // TODO: properly detect fom chain or georgi method
  return of(strategyConfig['aave-earn'])
}

function AaveMultiplyHeader({ strategyName }: { strategyName: string }) {
  return <div>multiply header{strategyName}</div>
}

function AaveMultiplySimulate() {
  return <>aave multiply simulate section</>
}

function AaveMultiplyManageComponent() {
  return <>aave multiply manage section</>
}

export const strategyConfig: Record<string, StrategyConfig> = {
  'aave-earn': {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    viewComponents: {
      headerOpen: AavePositionHeaderWithDetails,
      headerManage: AavePositionHeader,
      simulateSection: SimulateSectionComponent,
      vaultDetails: ManageSectionComponent,
    },
  },
  'aave-multiply': {
    name: 'stETHusdc',
    urlSlug: 'stETHusdc',
    viewComponents: {
      headerOpen: AaveMultiplyHeader,
      headerManage: AaveMultiplyHeader,
      simulateSection: AaveMultiplySimulate,
      vaultDetails: AaveMultiplyManageComponent,
    },
  },
}

export const strategyFromUrlSlug = (urlSlug: string): StrategyConfig => {
  const strategy = keyBy(strategyConfig, 'urlSlug')[urlSlug]
  if (!strategy) {
    throw new Error(`Strategy with urlSlug ${urlSlug} not found`)
  }
  return strategy
}

export function AaveManagePositionView({ address }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'stETHeth' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  const [aaveStrategy, aaveStrategyError] = useObservable(getAaveStrategy$(address))
  return (
    <WithErrorHandler error={[stateMachineError, aaveReserveStateError, aaveStrategyError]}>
      <WithLoadingIndicator
        value={[stateMachine, aaveReserveState, aaveReserveDataETH, aaveStrategy]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_stateMachine, _aaveReserveState, _aaveReserveDataETH, _aaveStrategy]) => {
          return (
            <AaveManageContainer
              strategyConfig={_aaveStrategy}
              manageAaveStateMachine={_stateMachine}
              aaveReserveState={_aaveReserveState}
              aaveReserveDataETH={_aaveReserveDataETH}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
