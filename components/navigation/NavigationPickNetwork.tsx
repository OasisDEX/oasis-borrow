import { Icon } from '@makerdao/dai-ui-icons'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { networksByName } from 'blockchain/config'
import { NetworkNameType, networksList } from 'blockchain/networksList'
import { AppSpinner, AppSpinnerWholePage } from 'helpers/AppSpinner'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useNetworkName } from 'helpers/useNetworkName'
import React from 'react'
import { Box, Button, Image } from 'theme-ui'

import { NavigationOrb } from './NavigationMenuOrb'

export function NavigationPickNetwork() {
  const [{ chains: usableChains, settingChain }, setChain] = useSetChain()
  const currentNetworkName = useNetworkName()
  const [, setCustomNetwork] = useCustomNetworkParameter()
  const changeChain = (networkName: NetworkNameType) => () => {
    const network = networksByName[networkName]
    setChain({ chainId: network.hexId })
      .then((setChainSuccess) => {
        setChainSuccess &&
          setCustomNetwork({
            network: network.name,
            id: network.id,
            hexId: network.hexId,
          })
      })
      .catch(console.error)
  }
  return (
    <Box sx={{ mr: 2 }}>
      <NavigationOrb
        customIcon={NavigationPickNetworkIcon}
        outline={{
          outline: '1px solid',
          outlineColor: 'primary100',
        }}
      >
        {(isOpen) =>
          isOpen && (
            <>
              <Box
                sx={{
                  width: ['100%', '240px'],
                  gap: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 3,
                }}
              >
                {Object.keys(networksList).map((networkListName) => {
                  const networkData = networksList[networkListName as NetworkNameType]
                  const isCurrentNetwork = networkListName === currentNetworkName
                  return (
                    <Button
                      variant="networkPicker"
                      sx={{
                        fontWeight: isCurrentNetwork ? '600' : '400',
                      }}
                      onClick={changeChain(networkListName as NetworkNameType)}
                      disabled={
                        !usableChains.map(({ label }) => label).includes(networkListName) ||
                        settingChain
                      }
                      key={networkListName}
                    >
                      <Image
                        src={networkData.icon}
                        sx={{
                          mr: 3,
                          minWidth: 4,
                          minHeight: 4,
                        }}
                      />
                      {networkData.displayName}
                      {isCurrentNetwork && (
                        <Box sx={{ width: '100%', textAlign: 'right' }}>
                          <Icon name="tick" color="interactive100" />
                        </Box>
                      )}
                    </Button>
                  )
                })}
              </Box>
              {settingChain && <AppSpinnerWholePage />}
            </>
          )
        }
      </NavigationOrb>
    </Box>
  )
}

function NavigationPickNetworkIcon(_isOpen: boolean) {
  const [{ connecting: isWalletConnecting }] = useConnectWallet()
  const networkName = useNetworkName()
  return isWalletConnecting ? (
    <AppSpinner />
  ) : (
    <Image src={networksList[networkName].icon} sx={{ width: '42px', height: '42px' }} />
  )
}
