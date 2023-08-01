import {
  enableNetworksSet,
  getOppositeNetworkHexIdByHexId,
  mainnetNetworkParameter,
  NetworkConfigHexId,
  NetworkIds,
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
import { useConnection } from 'features/web3OnBoard'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useModal } from 'helpers/modalHook'
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
  const { connectedChain, connect, connecting } = useConnection({
    initialConnect: false,
  })
  const currentNetworkName = connectedChain ? networkSetByHexId[connectedChain]?.name : undefined
  const openModal = useModal()

  const useTestnets = useFeatureToggle('UseNetworkSwitcherTestnets')
  const useForks = useFeatureToggle('UseNetworkSwitcherForks')
  const useArbitrum = useFeatureToggle('UseNetworkSwitcherArbitrum')
  const useOptimism = useFeatureToggle('UseNetworkSwitcherOptimism')

  const toggleChains = (currentConnectedChain: NetworkConfigHexId) => {
    return connect(getOppositeNetworkHexIdByHexId(currentConnectedChain), { forced: true })
  }
  const [currentHoverNetworkName, setCurrentHoverNetworkName] = useState<NetworkNames | undefined>(
    currentNetworkName,
  )
  const { hexId: customNetworkHexId } = mainnetNetworkParameter

  return (
    <NavigationOrb customIcon={NavigationNetworkSwitcherIcon}>
      {(_isOpen) => (
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
              .filter((network) => {
                if (network.id === NetworkIds.OPTIMISMMAINNET && !useOptimism) {
                  return false
                }
                if (network.id === NetworkIds.ARBITRUMMAINNET && !useArbitrum) {
                  return false
                }
                return true
              })
              .map((network) => (
                <NetworkButton
                  key={network.id}
                  network={network}
                  connect={connect}
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
