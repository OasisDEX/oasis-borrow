import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import type { RefinanceContextInput } from 'features/refinance/contexts'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
import { useMorphoRefinanceContextInputs } from 'features/refinance/hooks/useMorphoRefinanceContextInputs'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import React, { type PropsWithChildren, useContext, useMemo } from 'react'

interface OmniRefinanceContext {
  refinanceContextInput?: RefinanceContextInput
}

const omniRefinanceContext = React.createContext<OmniRefinanceContext | undefined>(undefined)

export function useOmniRefinanceContext(): OmniRefinanceContext {
  const context = useContext(omniRefinanceContext)

  if (!context) throw new Error('OmniRefinanceContext not available!')
  return context
}

export function OmniRefinanceContextProvider({
  children,
}: PropsWithChildren<OmniRefinanceContext>) {
  const { walletAddress } = useAccount()

  const {
    environment: {
      collateralToken,
      quoteToken,
      collateralBalance,
      quoteBalance,
      collateralPrice,
      quotePrice,
      ethPrice,
      isOwner,
      networkId,
      poolId,
      pairId,
      positionId,
      productType,
      protocol,
      slippage,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
    automation: { positionTriggers },
  } = useOmniProductContext(productType)

  const borrowRate = 'borrowRate' in position ? position.borrowRate : undefined
  const ltv = 'riskRatio' in position ? position.riskRatio.loanToValue : undefined
  const maxLtv = 'maxRiskRatio' in position ? position.maxRiskRatio.loanToValue : undefined
  const liquidationPrice = 'liquidationPrice' in position ? position.liquidationPrice : undefined

  const refinanceHasAllData =
    positionId && borrowRate && poolId && ltv && maxLtv && liquidationPrice
  const morphoRefinanceInput = !refinanceHasAllData
    ? undefined
    : useMorphoRefinanceContextInputs({
        address: walletAddress,
        networkId,
        collateralTokenSymbol: collateralToken,
        debtTokenSymbol: quoteToken,
        collateralAmount: collateralBalance.toString(),
        debtAmount: quoteBalance.toString(),
        vaultId: positionId,
        slippage: slippage.toNumber(),
        collateralPrice: collateralPrice.toString(),
        debtPrice: quotePrice.toString(),
        ethPrice: ethPrice.toString(),
        borrowRate: borrowRate.toString(),
        liquidationPrice: liquidationPrice.toString(),
        ltv: ltv.toString(),
        maxLtv: maxLtv.toString(),
        marketId: poolId,
        positionType: omniProductTypeToSDKType(productType),
        isOwner,
        pairId,
        triggerData: positionTriggers,
        owner: position.owner,
      })

  let refinanceInput: RefinanceContextInput | undefined
  // TODO: Add support for other protocols
  switch (protocol) {
    case LendingProtocol.MorphoBlue:
      refinanceInput = morphoRefinanceInput
      break
  }

  const refinanceContextInput = !refinanceHasAllData ? undefined : refinanceInput

  const context: OmniRefinanceContext = useMemo(() => {
    return {
      refinanceContextInput,
    }
  }, [refinanceContextInput])

  return <omniRefinanceContext.Provider value={context}>{children}</omniRefinanceContext.Provider>
}
