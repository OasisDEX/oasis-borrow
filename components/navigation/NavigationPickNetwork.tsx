import { Icon } from '@makerdao/dai-ui-icons'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { NetworkConfig, networks, networksByName } from 'blockchain/networksConfig'
import { useAppContext } from 'components/AppContextProvider'
import { AppSpinner, AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useObservable } from 'helpers/observableHook'
import { useNetworkName } from 'helpers/useNetworkName'
import { env } from 'process'
import React, { useCallback } from 'react'
import { Box, Button, Image } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'

const filterNetworks = (network: NetworkConfig) => {
  const isDev = env.NODE_ENV !== 'production'
  const showTestnetsParam =
    window && new URLSearchParams(window.location.search).get('testnets') !== null
  if (network['enabled']) {
    return !network['testnet'] || isDev || showTestnetsParam
  }
  return false
}

export function NavigationPickNetwork() {
  const { web3Context$ } = useAppContext()
  const [{ chains: usableChains, settingChain, connectedChain }, setChain] = useSetChain()
  const currentNetworkName = useNetworkName()
  const [, setCustomNetwork] = useCustomNetworkParameter()
  const [web3Context] = useObservable(web3Context$)
  const changeChain = useCallback(
    (networkName: string) => () => {
      const network = networksByName[networkName]
      if (connectedChain) {
        // wallet is connected, change it there so it updates everywhere
        setChain({ chainId: network.hexId! })
          .then((setChainSuccess) => {
            setChainSuccess &&
              setCustomNetwork({
                network: network.name!,
                id: network.id!,
                hexId: network.hexId!,
              })
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
  return (
    <Box sx={{ mr: 2 }}>
      <NavigationOrb
        customIcon={NavigationPickNetworkIcon}
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
              {networks.filter(filterNetworks).map((network) => {
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
                      },
                    }}
                    onClick={changeChain(network.name)}
                    disabled={
                      !usableChains.map(({ label }) => label).includes(network.label) ||
                      settingChain
                    }
                    key={network.hexId}
                  >
                    <Image
                      src={network.icon}
                      sx={{
                        mr: 3,
                        minWidth: 4,
                        minHeight: 4,
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
              })}
            </Box>
            {settingChain && <AppSpinnerWholePage />}
          </>
        )}
      </NavigationOrb>
    </Box>
  )
}

function NavigationPickNetworkIcon(_isOpen: boolean) {
  const [{ connecting: isWalletConnecting }] = useConnectWallet()
  const currentNetworkName = useNetworkName()
  return isWalletConnecting ? (
    <AppSpinner />
  ) : (
    <Image src={networksByName[currentNetworkName].icon} sx={{ width: '42px', height: '42px' }} />
  )
}
