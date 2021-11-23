import BigNumber from 'bignumber.js'
import React from 'react'

export function AdjustSlForm({ id }: { id: BigNumber }) {
  console.log('AdjustSlForm vaultId', id.toString())
  return <h1>{id.toString()}</h1>
}
