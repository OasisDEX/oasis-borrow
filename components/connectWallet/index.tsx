import { NetworkConfigHexId } from 'blockchain/networks'
import { WithChildren } from 'helpers/types'
import React from 'react'

import { Connection } from './Connection'

export const WithConnection = ({
  children,
  pageChainId,
}: WithChildren & { pageChainId?: NetworkConfigHexId }) => (
  <Connection walletConnect={false} pageChainId={pageChainId}>
    {children}
  </Connection>
)
export const WithWalletConnection = ({
  children,
  chainId,
}: WithChildren & { chainId: NetworkConfigHexId }) => (
  <Connection walletConnect={true} chainId={chainId} pageChainId={chainId}>
    {children}
  </Connection>
)
