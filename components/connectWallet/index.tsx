import React from 'react'
import { NetworkConfigHexId } from 'blockchain/networks'
import { Connection } from 'components/connectWallet/Connection'
import { WithChildren } from 'helpers/types'

export const WithConnection = ({
  children,
  pageChainId,
  includeTestNet,
}: WithChildren & { pageChainId?: NetworkConfigHexId; includeTestNet?: boolean }) => (
  <Connection walletConnect={false} pageChainId={pageChainId} includeTestNet={includeTestNet}>
    {children}
  </Connection>
)
export const WithWalletConnection = ({
  children,
  chainId,
  includeTestNet,
}: WithChildren & { chainId: NetworkConfigHexId; includeTestNet?: boolean }) => (
  <Connection walletConnect chainId={chainId} pageChainId={chainId} includeTestNet={includeTestNet}>
    {children}
  </Connection>
)
