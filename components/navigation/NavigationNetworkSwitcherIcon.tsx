import { networkSetById } from 'blockchain/networks'
import { useWeb3OnBoardConnectorContext } from 'features/web3OnBoard'
import { AppSpinner } from 'helpers/AppSpinner'
import React, { useEffect, useState } from 'react'
import { Image } from 'theme-ui'

export function NavigationNetworkSwitcherIcon() {
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const {
    connecting: isWalletConnecting,
    connector,
    networkConnector,
  } = useWeb3OnBoardConnectorContext()
  const networkId = connector?.connectorInformation.chainId
  const networkConfig = networkId ? networkSetById[networkId] : undefined

  useEffect(() => {
    if (networkConfig && networkConfig.icon !== icon) {
      setIcon(networkConfig.icon)
    } else {
      void networkConnector.getChainId().then((chainId) => {
        if (chainId && networkSetById[chainId].icon !== icon) {
          setIcon(networkSetById[chainId].icon)
        }
      })
    }
  }, [networkConfig, networkConnector, icon])

  return isWalletConnecting || !icon ? (
    <AppSpinner />
  ) : (
    <Image src={icon} sx={{ width: '32px', height: '32px' }} />
  )
}
