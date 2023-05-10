import { useConnectWallet } from '@web3-onboard/react'
import { networksByName } from 'blockchain/networksConfig'
import { AppSpinner } from 'helpers/AppSpinner'
import { useNetworkName } from 'helpers/useNetworkName'
import { Image } from 'theme-ui'

export function NavigationNetworkSwitcherIcon(_isOpen: boolean) {
  const [{ connecting: isWalletConnecting }] = useConnectWallet()
  const currentNetworkName = useNetworkName()
  return isWalletConnecting ? (
    <AppSpinner />
  ) : (
    <Image
      src={networksByName[currentNetworkName.replace('-hardhat', '')].icon}
      sx={{ width: '42px', height: '42px' }}
    />
  )
}
