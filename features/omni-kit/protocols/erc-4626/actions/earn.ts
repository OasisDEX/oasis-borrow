import { strategies } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import { zero } from 'helpers/zero'

export interface Erc4626CommonPayload {
  proxyAddress: string
  quoteAddress: string
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  slippage: BigNumber
  user: string
  vault: string
}

// TODO: replace with direct imports from dma library
export type Erc4626Dependencies = Parameters<typeof strategies.common.erc4626.deposit>[1]

export const erc4626ActionDepositEarn = ({
  commonPayload: { quoteAddress, quotePrecision, quotePrice, quoteToken, ...commonPayload },
  dependencies,
  state,
}: {
  commonPayload: Erc4626CommonPayload
  dependencies: Erc4626Dependencies
  state: OmniEarnFormState
}) => {
  const { depositAmount } = state

  return strategies.common.erc4626.deposit(
    {
      ...commonPayload,
      amount: depositAmount ?? zero,
      depositTokenAddress: quoteAddress,
      depositTokenPrecision: quotePrecision,
      depositTokenSymbol: quoteToken,
      pullTokenAddress: quoteAddress,
      pullTokenPrecision: quotePrecision,
      pullTokenSymbol: quoteToken,
      quoteTokenPrice: quotePrice,
    },
    dependencies,
  )
}

export const erc4626ActionWithdrawEarn = ({
  commonPayload: { quoteAddress, quotePrecision, quotePrice, quoteToken, ...commonPayload },
  dependencies,
  state,
}: {
  commonPayload: Erc4626CommonPayload
  dependencies: Erc4626Dependencies
  state: OmniEarnFormState
}) => {
  const { withdrawAmount } = state

  return strategies.common.erc4626.withdraw(
    {
      ...commonPayload,
      amount: withdrawAmount ?? zero,
      quoteTokenPrice: quotePrice,
      returnTokenAddress: quoteAddress,
      returnTokenPrecision: quotePrecision,
      returnTokenSymbol: quoteToken,
      withdrawTokenAddress: quoteAddress,
      withdrawTokenPrecision: quotePrecision,
      withdrawTokenSymbol: quoteToken,
    },
    dependencies,
  )
}
