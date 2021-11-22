import BigNumber from 'bignumber.js'
import React from 'react'

export interface ProtectionDetailsLayoutProps {
  isToCollateral: boolean
  stopLossLevel: BigNumber
  isStopLossEnabled: boolean
}

export function ProtectionDetailsLayout(props: ProtectionDetailsLayoutProps) {
  return (
    <h1>
      TODO Protection Level = {props.toString()}, CloseToCollateral = {props.isToCollateral},
      Enabled = {props.isStopLossEnabled.toString()}
    </h1>
  )
}
