import {
  enableNetworksSet,
  getOppositeNetworkHexIdByHexId,
  mainnetNetworkParameter,
  NetworkConfigHexId,
  NetworkNames,
  networkSetByHexId,
} from 'blockchain/networks'
import {
  filterNetworksAccordingToSavedNetwork,
  filterNetworksAccordingToWalletNetwork,
  isTestnet,
  isTestnetEnabled,
  isTestnetNetworkHexId,
} from 'blockchain/networks'
import { useConnection, useWalletManagement } from 'features/web3OnBoard'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useModalContext } from 'helpers/modalHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useState } from 'react'
import { Box, Button } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'
import { NetworkButton } from './NavigationNetworkSwitcherButton'
import { NavigationNetworkSwitcherIcon } from './NavigationNetworkSwitcherIcon'
import { L2BeatSection } from './NavigationNetworkSwitcherL2BeatButton'
import { NavigationNetworkSwitcherModal } from './NavigationNetworkSwitcherModal'

const renderSeparator = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="216" height="1" viewBox="0 0 216 1" fill="none">
      <rect width="216" height="1" fill="#EAEAEA" />
    </svg>
  )
}

export function NavigationNetworkSwitcherOrb() {
  const { connect, connecting, setChain } = useConnection()
  const { wallet } = useWalletManagement()
  const connectedChain = wallet?.chainHexId
  const currentNetworkName = connectedChain ? networkSetByHexId[connectedChain]?.name : undefined
  const { openModal } = useModalContext()

  const useTestnets = useFeatureToggle('UseNetworkSwitcherTestnets')
  const useForks = useFeatureToggle('UseNetworkSwitcherForks')

  const toggleChains = (currentConnectedChain: NetworkConfigHexId) => {
    return connect(getOppositeNetworkHexIdByHexId(currentConnectedChain))
  }
  const [currentHoverNetworkName, setCurrentHoverNetworkName] = useState<NetworkNames | undefined>(
    currentNetworkName,
  )
  const { hexId: customNetworkHexId } = mainnetNetworkParameter

  return (
    <NavigationOrb customIcon={NavigationNetworkSwitcherIcon}>
      {() => (
        <>
          <Box
            sx={{
              width: ['100%', '240px'],
              gap: 2,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 12px',
              overflow: 'hidden',
            }}
          >
            {enableNetworksSet
              .filter(
                connectedChain
                  ? filterNetworksAccordingToWalletNetwork(connectedChain)
                  : filterNetworksAccordingToSavedNetwork(customNetworkHexId),
              )
              .map((network) => (
                <NetworkButton
                  key={network.hexId}
                  network={network}
                  setChain={setChain}
                  connecting={connecting}
                  currentNetworkName={currentNetworkName}
                  currentHoverNetworkName={currentHoverNetworkName}
                  setCurrentHoverNetworkName={setCurrentHoverNetworkName}
                />
              ))}
            {renderSeparator()}
            <L2BeatSection />
            {(connectedChain || isTestnetEnabled()) && (
              <>
                {useTestnets && (
                  <Button
                    variant="bean"
                    sx={{ fontSize: 2 }}
                    onClick={() => toggleChains(connectedChain ?? customNetworkHexId)}
                  >
                    <Box sx={{ width: '100%' }}>
                      {(() => {
                        if (connectedChain) {
                          return `Change to ${
                            isTestnet(connectedChain) ? 'main net 🏠' : 'test net 🌲'
                          }`
                        }
                        if (isTestnetNetworkHexId(customNetworkHexId)) {
                          return 'Change to main net 🏠'
                        }
                        return 'Change to test net 🌲'
                      })()}
                    </Box>
                  </Button>
                )}

                {useForks && (
                  <Button
                    variant="bean"
                    sx={{ fontSize: 2 }}
                    onClick={() => openModal(NavigationNetworkSwitcherModal, {})}
                  >
                    <Box sx={{ width: '100%' }}>Fork settings 👷‍♂️</Box>
                  </Button>
                )}
              </>
            )}
          </Box>
          {connecting && <AppSpinnerWholePage />}
        </>
      )}
    </NavigationOrb>
  )
}
