import { useWeb3OnBoardConnectorContext } from 'features/web3OnBoard/web3OnBoardConnectorProvider'
import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'
import { Image } from 'theme-ui'

export function NavigationNetworkSwitcherIcon(_isOpen: boolean) {
  const { connecting: isWalletConnecting, networkConfig } = useWeb3OnBoardConnectorContext()
  const icon = networkConfig?.icon
  return isWalletConnecting || !icon ? (
    <AppSpinner />
  ) : (
    <Image src={icon} sx={{ width: '42px', height: '42px' }} />
  )
}
