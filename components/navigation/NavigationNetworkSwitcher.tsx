import { Icon } from '@makerdao/dai-ui-icons'
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
import { NetworkConfig } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useModal } from 'helpers/modalHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import l2beatLogo from 'public/static/img/l2beat-logo.svg'
import React, { useState } from 'react'
import { Box, Button, Image, Link } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'
import { NavigationNetworkSwitcherIcon } from './NavigationNetworkSwitcherIcon'
import { NavigationNetworkSwitcherModal } from './NavigationNetworkSwitcherModal'

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

  const NetworkButton = ({
    network,
    currentHoverNetworkName,
    setCurrentHoverNetworkName,
  }: {
    network: NetworkConfig
    currentHoverNetworkName: NetworkNames | undefined
    setCurrentHoverNetworkName: React.Dispatch<React.SetStateAction<NetworkNames | undefined>>
  }) => {
    const isCurrentNetwork = network.name === currentNetworkName
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 12px',
        }}
      >
        <Button
          variant="networkPicker"
          sx={{
            p: 0,
            fontWeight: isCurrentNetwork ? '600' : '400',
            whiteSpace: 'pre',
            ':hover': {
              fontWeight: '600',
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
          onMouseOver={() => {
            setCurrentHoverNetworkName(network.name)
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
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
            </Box>
            <Box
              sx={{
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
          </Box>
        </Button>
        {(currentHoverNetworkName === network.name || currentNetworkName === network.name) &&
          network.links && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 8,
                backgroundColor: 'neutral30',
                color: 'interactive100',
                gap: '8px',
                padding: '12px',
              }}
            >
              {network.links.map((link) => (
                <Link
                  href={link.url}
                  target="_blank"
                  sx={{
                    // cursor: 'pointer',
                    height: 22,
                    lineHeight: '22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                  }}
                >
                  {link.label}
                  <Icon name="arrow_right_light" />
                </Link>
              ))}
            </Box>
          )}
      </Box>
    )
  }

  const renderSeparator = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="216"
        height="1"
        viewBox="0 0 216 1"
        fill="none"
      >
        <rect width="216" height="1" fill="#EAEAEA" />
      </svg>
    )
  }

  const L2BeatSection = () => {
    const [hover, setHover] = useState<boolean>(false)

    return (
      <>
        <Link
          as={'a'}
          href="https://l2beat.com/scaling/summary"
          target="_blank"
          variant="networkPicker"
          sx={{
            fontWeight: '400',
            whiteSpace: 'pre',
            ':hover': {
              fontWeight: '600',
            },
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseOver={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              src={l2beatLogo}
              sx={{
                mr: 3,
                minWidth: 4,
                minHeight: 4,
                position: 'relative',
                zIndex: '2',
              }}
            />
            {'L2Beat'}
          </Box>
          {hover && <Icon name="arrow_right_light" />}
        </Link>
        {hover && (
          <Box>
            L2BEAT is an analytics and research website about Ethereum layer two (L2) scaling.
          </Box>
        )}
      </>
    )
  }

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
              padding: '12px',
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
                  network={network}
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
