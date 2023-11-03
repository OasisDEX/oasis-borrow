import type { NetworkConfigHexId } from 'blockchain/networks'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { Connection } from './Connection'

export const WithConnection = ({
  children,
  pageChainId,
  includeTestNet,
}: PropsWithChildren<{ pageChainId?: NetworkConfigHexId; includeTestNet?: boolean }>) => (
  <Connection walletConnect={false} pageChainId={pageChainId} includeTestNet={includeTestNet}>
    {children}
  </Connection>
)
export const WithWalletConnection = ({
  children,
  chainId,
  includeTestNet,
}: PropsWithChildren<{ chainId: NetworkConfigHexId; includeTestNet?: boolean }>) => (
  <Connection
    walletConnect={true}
    chainId={chainId}
    pageChainId={chainId}
    includeTestNet={includeTestNet}
  >
    {children}
  </Connection>
)
