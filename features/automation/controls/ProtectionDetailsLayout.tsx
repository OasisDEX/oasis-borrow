import BigNumber from 'bignumber.js'
import React from 'react'

export interface ProtectionDetailsLayoutProps {
  slRatio: BigNumber
  vaultDebt: BigNumber
  currentOraclePrice: BigNumber
  nextOraclePrice: BigNumber
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
}

export function ProtectionDetailsLayout(props: ProtectionDetailsLayoutProps) {
  return <h1>ALL DATA AVAILABLE: {JSON.stringify(props)}</h1>
}
