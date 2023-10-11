import type { NetworkNames } from 'blockchain/networks'
import {
  enableNetworksSet,
  filterNetworksAccordingToSavedNetwork,
  filterNetworksAccordingToWalletNetwork,
  isTestnet,
  isTestnetEnabled,
  isTestnetNetworkHexId,
  NetworkIdToNetworkHexIds,
  networkSetByHexId,
} from 'blockchain/networks'
import { useConnection, useWalletManagement } from 'features/web3OnBoard/useConnection'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useAppConfig } from 'helpers/config'
import { useModalContext } from 'helpers/modalHook'
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
  const { connecting, toggleBetweenMainnetAndTestnet, setChain } = useConnection()
  const { wallet, chainId } = useWalletManagement()
  const connectedChain = wallet?.chainHexId
  const currentNetworkName = connectedChain ? networkSetByHexId[connectedChain]?.name : undefined
  const { openModal } = useModalContext()
  const { UseNetworkSwitcherTestnets, UseNetworkSwitcherForks } = useAppConfig('features')

  const [currentHoverNetworkName, setCurrentHoverNetworkName] = useState<NetworkNames | undefined>(
    currentNetworkName,
  )

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
                  : filterNetworksAccordingToSavedNetwork(NetworkIdToNetworkHexIds(chainId)),
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
                {UseNetworkSwitcherTestnets && (
                  <Button
                    variant="bean"
                    sx={{ fontSize: 2 }}
                    onClick={() => toggleBetweenMainnetAndTestnet()}
                  >
                    <Box sx={{ width: '100%' }}>
                      {(() => {
                        if (connectedChain) {
                          return `Change to ${
                            isTestnet(connectedChain) ? 'main net 🏠' : 'test net 🌲'
                          }`
                        }
                        if (isTestnetNetworkHexId(NetworkIdToNetworkHexIds(chainId))) {
                          return 'Change to main net 🏠'
                        }
                        return 'Change to test net 🌲'
                      })()}
                    </Box>
                  </Button>
                )}

                {UseNetworkSwitcherForks && (
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
