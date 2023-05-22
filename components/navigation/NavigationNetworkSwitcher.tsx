import { Icon } from '@makerdao/dai-ui-icons'
import { ConnectedChain } from '@web3-onboard/core'
import { useSetChain } from '@web3-onboard/react'
import {
  CustomNetworkStorageKey,
  mainnetNetworkParameter,
  networksListWithForksByHexId,
  networksSet,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import {
  filterNetworksAccordingToSavedNetwork,
  filterNetworksAccordingToWalletNetwork,
  getOppositeNetworkHexIdByHexId,
  isTestnet,
  isTestnetEnabled,
  isTestnetNetworkHexId,
} from 'blockchain/networks'
import { NetworkConfig, NetworkConfigHexId } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { getStorageValue } from 'helpers/useLocalStorage'
import { useNetworkName } from 'helpers/useNetworkName'
import React, { useCallback } from 'react'
import { Box, Button, Image } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'
import { NavigationNetworkSwitcherIcon } from './NavigationNetworkSwitcherIcon'
import { NavigationNetworkSwitcherModal } from './NavigationNetworkSwitcherModal'

export function NavigationNetworkSwitcher() {
  const { web3Context$ } = useAppContext()
  const [{ settingChain, connectedChain }, setChain] = useSetChain()
  const currentNetworkName = useNetworkName()
  const [, setCustomNetwork] = useCustomNetworkParameter()
  const [web3Context] = useObservable(web3Context$)
  const openModal = useModal()
  // @ts-ignore
  const changeChain = useCallback(
    (networkHexId: NetworkConfigHexId) => () => {
      const network = networksListWithForksByHexId[networkHexId]

      const chainToSet = network.isCustomFork
        ? { chainId: network.hexId, rpcUrl: network.rpcUrl, label: network.label }
        : { chainId: network.hexId }

      console.log(`Chain to set: ${JSON.stringify(chainToSet)}`)
      if (network.isCustomFork) {
        // @ts-ignore
        window.ethereum
          ?.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.hexId,
                rpcUrls: [network.rpcUrl],
                chainName: network.label,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          })
          .catch(console.error)
      }
      if (connectedChain) {
        // wallet is connected, change it there so it updates everywhere
        setChain(chainToSet)
          .then((setChainSuccess) => {
            setChainSuccess &&
              setCustomNetwork({
                network: network.name!,
                id: network.id!,
                hexId: network.hexId!,
              })
            window && window.location.reload() // duh
          })
          .catch(console.error)
        return
      }
      if (web3Context?.status === 'connectedReadonly') {
        setCustomNetwork({
          network: network.name!,
          id: network.id!,
          hexId: network.hexId!,
        })
        window && window.location.reload() // duh
      }
    },
    [connectedChain, setChain, setCustomNetwork, web3Context?.status],
  )

  const toggleChains = (currentConnectedChain: ConnectedChain) =>
    changeChain(getOppositeNetworkHexIdByHexId(currentConnectedChain.id)!)
  const customNetworkData = getStorageValue(CustomNetworkStorageKey, '')
  const { hexId: customNetworkHexId } = (customNetworkData ||
    mainnetNetworkParameter) as typeof mainnetNetworkParameter

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
        onClick={changeChain(network.hexId)}
        disabled={settingChain}
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
    <NavigationOrb
      customIcon={NavigationNetworkSwitcherIcon}
      outline={{
        outline: '1px solid',
        outlineColor: 'primary100',
      }}
    >
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
            {networksSet
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
                  onClick={toggleChains(
                    connectedChain || {
                      id: customNetworkHexId as ConnectedChain['id'],
                      namespace: 'evm',
                    },
                  )}
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
          {settingChain && <AppSpinnerWholePage />}
        </>
      )}
    </NavigationOrb>
  )
}
