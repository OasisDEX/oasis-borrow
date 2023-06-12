import { NetworkConfigHexId } from 'blockchain/networks'
import { WithChildren } from 'helpers/types'
import React from 'react'

import { Connection } from './Connection'

export const WithConnection = ({ children }: WithChildren) => (
  <Connection walletConnect={false}>{children}</Connection>
)
export const WithWalletConnection = ({
  children,
  chainId,
}: WithChildren & { chainId: NetworkConfigHexId }) => (
  <Connection walletConnect={true} chainId={chainId}>
    {children}
  </Connection>
)
