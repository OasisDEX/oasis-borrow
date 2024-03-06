import type BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React, { type FC } from 'react'

interface OmniStaticRightBoundaryProps {
  value: BigNumber
  label: string
}

export const OmniStaticBoundary: FC<OmniStaticRightBoundaryProps> = ({ value, label }) => (
  <>
    {formatCryptoBalance(value)} {label}
  </>
)
