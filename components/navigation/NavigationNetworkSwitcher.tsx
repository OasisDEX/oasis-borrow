import { Icon } from '@makerdao/dai-ui-icons'
import {
  enableNetworksSet,
  getOppositeNetworkHexIdByHexId,
  mainnetNetworkParameter,
  NetworkConfigHexId,
  networkSetByHexId,
} from 'blockchain/networks'
import {
  filterNetworksAccordingToSavedNetwork,
  filterNetworksAccordingToWalletNetwork,
  isTestnet,
  isTestnetEnabled,
  isTestnetNetworkHexId,
} from 'blockchain/networks'
import { NetworkConfig } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useModal } from 'helpers/modalHook'
import React from 'react'
import { Box, Button, Image } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'
import { NavigationNetworkSwitcherIcon } from './NavigationNetworkSwitcherIcon'
import { NavigationNetworkSwitcherModal } from './NavigationNetworkSwitcherModal'

export function NavigationNetworkSwitcherOrb() {
  const { connectedChain, connect, connecting } = useConnection({
    initialConnect: false,
  })
  const currentNetworkName = connectedChain ? networkSetByHexId[connectedChain]?.name : undefined
  const openModal = useModal()

  const toggleChains = (currentConnectedChain: NetworkConfigHexId) => {
    return connect(getOppositeNetworkHexIdByHexId(currentConnectedChain), { forced: true })
  }
  const { hexId: customNetworkHexId } = mainnetNetworkParameter

  const handleNetworkButton = (network: NetworkConfig) => {
    const isCurrentNetwork = network.name === currentNetworkName
    return (
      <Button
        variant="networkPicker"
        sx={{
          fontWeight: isCurrentNetwork ? '600' : '400',
          whiteSpace: 'pre',
          color: isCurrentNetwork ? 'primary100' : 'neutral80',
          ':hover': {
            color: 'primary100',
            ...(network.isCustomFork && {
              '::before': {
                top: '-5px',
                left: '-5px',
              },
            }),
          },
          ...(network.isCustomFork && {
            '::before': {
              content: '"👷‍♂️"',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '36px',
              height: '36px',
              display: 'block',
              zIndex: '1',
              transform: 'rotate(-40deg)',
              transition: '0.2s top, 0.2s left',
            },
          }),
        }}
        onClick={() => connect(network.hexId)}
        disabled={connecting}
        key={network.hexId}
      >
        <Image
          src={network.icon}
          sx={{
            mr: 3,
            minWidth: 4,
            minHeight: 4,
            position: 'relative',
            zIndex: '2',
          }}
        />
        {network.label}
        <Box
          sx={{
            width: '100%',
            textAlign: 'right',
            position: 'relative',
            opacity: isCurrentNetwork ? 1 : 0,
            left: isCurrentNetwork ? 0 : 2,
            transition: '0.2s opacity, 0.2s left',
            mb: '-3px',
          }}
        >
          <Icon name="tick" color="interactive100" />
        </Box>
      </Button>
    )
  }

  return (
    <NavigationOrb customIcon={NavigationNetworkSwitcherIcon}>
      {(_isOpen) => (
        <>
          <Box
            sx={{
              width: ['100%', '260px'],
              gap: 2,
              display: 'flex',
              flexDirection: 'column',
              padding: 3,
              overflow: 'hidden',
            }}
          >
            {enableNetworksSet
              .filter(
                connectedChain
                  ? filterNetworksAccordingToWalletNetwork(connectedChain)
                  : filterNetworksAccordingToSavedNetwork(customNetworkHexId),
              )
              .map(handleNetworkButton)}
            {(connectedChain || isTestnetEnabled()) && (
              <>
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

                <Button
                  variant="bean"
                  sx={{ fontSize: 2 }}
                  onClick={() => openModal(NavigationNetworkSwitcherModal, {})}
                >
                  <Box sx={{ width: '100%' }}>Fork settings 👷‍♂️</Box>
                </Button>
              </>
            )}
          </Box>
          {connecting && <AppSpinnerWholePage />}
        </>
      )}
    </NavigationOrb>
  )
}
