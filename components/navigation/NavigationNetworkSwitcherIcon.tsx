import { networkSetById } from 'blockchain/networks'
import { useWeb3OnBoardConnectorContext } from 'features/web3OnBoard/web3-on-board-connector-provider'
import { AppSpinner } from 'helpers/AppSpinner'
import React, { useEffect, useState } from 'react'
import { Image } from 'theme-ui'

export function NavigationNetworkSwitcherIcon() {
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const {
    connecting: isWalletConnecting,
    state: { networkConnectorNetworkId },
  } = useWeb3OnBoardConnectorContext()

  useEffect(() => {
    if (networkConnectorNetworkId) {
      const networkConfig = networkSetById[networkConnectorNetworkId]
      if (networkConfig && networkConfig.icon !== icon) {
        setIcon(networkConfig.icon)
      }
    }
  }, [networkConnectorNetworkId, icon])

  return isWalletConnecting || !icon ? (
    <AppSpinner />
  ) : (
    <Image src={icon} sx={{ width: '32px', height: '32px' }} />
  )
}
