import type { NetworkConfigHexId } from 'blockchain/networks'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'

import { Connection } from './Connection'

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
  <Connection
    walletConnect={true}
    chainId={chainId}
    pageChainId={chainId}
    includeTestNet={includeTestNet}
  >
    {children}
  </Connection>
)
