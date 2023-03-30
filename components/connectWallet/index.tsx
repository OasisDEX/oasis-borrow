import { WithChildren } from 'helpers/types'
import React from 'react'

import { Connection } from './Connection'

export { disconnect } from './Disconnect'

export const WithConnection = ({ children }: WithChildren) => (
  <Connection walletConnect={false}>{children}</Connection>
)
export const WithWalletConnection = ({ children }: WithChildren) => (
  <Connection walletConnect={true}>{children}</Connection>
)
