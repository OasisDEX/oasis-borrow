import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { AavePositionAlreadyOpenedNotice } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useAaveContext } from '../../AaveContextProvider'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { createAaveUserConfiguration, hasOtherAssets } from '../../helpers/aaveUserConfiguration'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import {
  ManageAaveStateMachineContextProvider,
  useManageAaveStateMachineContext,
} from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
}

function AaveManageContainer({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataETH,
  address,
}: {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
  address: string
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const aaveProtection = useFeatureToggle('AaveProtection')

  if (!state.context.protocolData) {
    return null
  }

  return (
    <AaveAutomationContext
      aaveManageVault={{
        address,
        aaveReserveState,
        aaveReserveDataETH,
        aaveProtocolData: state.context.protocolData,
        strategyConfig,
      }}
    >
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <Header strategyName={strategyConfig.name} />
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
                      strategyConfig={strategyConfig}
                    />
                  </Box>
                  <Box>{<SidebarManageAaveVault config={strategyConfig} />}</Box>
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
            ...(aaveProtection
              ? [
                  {
                    label: t('system.protection'),
                    value: 'protection',
                    tag: { include: true, active: false },
                    content: <ProtectionControl />,
                  },
                ]
              : []),
          ]}
        />
        <Survey for="earn" />
      </Container>
    </AaveAutomationContext>
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

export function AaveManagePositionView({ address }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$, detectAaveStrategy$ } = useAaveContext()
  const { connectedContext$ } = useAppContext()
  const [context, contextError] = useObservable(connectedContext$)
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'stETHeth' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  const [aaveStrategy, aaveStrategyError] = useObservable(detectAaveStrategy$(address))
  return (
    <WithErrorHandler
      error={[stateMachineError, aaveReserveStateError, aaveStrategyError, contextError]}
    >
      <WithLoadingIndicator
        value={[stateMachine, aaveReserveState, aaveReserveDataETH, aaveStrategy, context]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_stateMachine, _aaveReserveState, _aaveReserveDataETH, _aaveStrategy, _context]) => {
          return (
            <ManageAaveStateMachineContextProvider machine={_stateMachine}>
              <AaveManageContainer
                strategyConfig={_aaveStrategy}
                aaveReserveState={_aaveReserveState}
                aaveReserveDataETH={_aaveReserveDataETH}
                address={_context.account}
              />
            </ManageAaveStateMachineContextProvider>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
