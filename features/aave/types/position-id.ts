export type PositionAddressType = 'EOA' | 'DS_PROXY' | 'DPM_PROXY'

export type PositionId = {
  vaultId?: number
  walletAddress?: string,
  external?: boolean
  positionAddress?: string
  positionAddressType?: PositionAddressType
}
