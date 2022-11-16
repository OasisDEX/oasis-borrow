import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { AaveProtocolData } from 'features/aave/manage/state'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { PositionOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { SidebarViewPositionAaveVault } from '../sidebars/SidebarViewPositionAaveVault'

interface AaveManageViewPositionViewProps {
  address: string
  proxyAddress?: string
}

function AavePositionContainer({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataETH,
  aaveProtocolData,
  address,
  connectedWalletAddress,
}: {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
  aaveProtocolData: AaveProtocolData
  address: string
  connectedWalletAddress?: string
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerView
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsView
  return (
    <AaveAutomationContext
      aaveManageVault={{
        address: connectedWalletAddress || '0x0',
        aaveReserveState,
        aaveReserveDataETH,
        aaveProtocolData,
        strategyConfig,
      }}
    >
      <Container variant="vaultPageContainer">
        <PositionOwnershipBanner
          account={address}
          connectedWalletAddress={connectedWalletAddress}
        />
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
                      aaveProtocolData={aaveProtocolData}
                      aaveReserveDataETH={aaveReserveDataETH}
                      strategyConfig={strategyConfig}
                    />
                  </Box>
                  <Box>
                    {
                      <SidebarViewPositionAaveVault
                        aaveProtocolData={aaveProtocolData}
                        strategyConfig={strategyConfig}
                      />
                    }
                  </Box>
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
    </AaveAutomationContext>
  )
}

export function AavePositionView({ address, proxyAddress }: AaveManageViewPositionViewProps) {
  const { connectedContext$ } = useAppContext()
  const { aaveProtocolData$, detectAaveStrategy$ } = useAaveContext()
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [connectedContext] = useObservable(connectedContext$)
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  const [aaveStrategy, aaveStrategyError] = useObservable(detectAaveStrategy$(address))
  const [aaveProtocolData, aaveProtocolDataError] = useObservable(
    aaveProtocolData$('STETH', proxyAddress ?? address),
  )

  return (
    <WithErrorHandler error={[aaveReserveStateError, aaveStrategyError, aaveProtocolDataError]}>
      <WithLoadingIndicator
        value={[aaveReserveState, aaveReserveDataETH, aaveStrategy, aaveProtocolData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_aaveReserveState, _aaveReserveDataETH, _aaveStrategy, _aaveProtocolData]) => {
          return (
            <AavePositionContainer
              strategyConfig={_aaveStrategy}
              aaveReserveState={_aaveReserveState}
              aaveReserveDataETH={_aaveReserveDataETH}
              aaveProtocolData={_aaveProtocolData}
              address={address}
              connectedWalletAddress={connectedContext?.account}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
