import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { isLendingPosition } from 'features/omni-kit/helpers'
import type { RefinanceContextInput } from 'features/refinance/contexts'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
import {
  useAaveLikeRefinanceContextInputs,
  useMorphoRefinanceContextInputs,
} from 'features/refinance/hooks'
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
      dpmProxy,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
    automation: { positionTriggers },
  } = useOmniProductContext(productType)

  let refinanceInput: RefinanceContextInput | undefined

  // only lending positions are currently allowed for refinance
  // positionId at this point should be already defined (manage view)
  if (!isLendingPosition(position) || !positionId) {
    return (
      <omniRefinanceContext.Provider value={undefined}>{children}</omniRefinanceContext.Provider>
    )
  }

  switch (protocol) {
    case LendingProtocol.MorphoBlue:
      const morphoRefinanceInput = useMorphoRefinanceContextInputs({
        address: walletAddress,
        networkId,
        collateralTokenSymbol: collateralToken,
        debtTokenSymbol: quoteToken,
        vaultId: positionId,
        slippage: slippage.toNumber(),
        collateralPrice: collateralPrice.toString(),
        debtPrice: quotePrice.toString(),
        ethPrice: ethPrice.toString(),
        marketId: poolId,
        positionType: omniProductTypeToSDKType(productType),
        isOwner,
        pairId,
        triggerData: positionTriggers,
        owner: position.owner,
        position,
      })
      refinanceInput = morphoRefinanceInput
      break
    case LendingProtocol.AaveV3:
    case LendingProtocol.SparkV3:
      const aaveLikeRefinanceInput = useAaveLikeRefinanceContextInputs({
        address: walletAddress,
        networkId,
        collateralTokenSymbol: collateralToken,
        debtTokenSymbol: quoteToken,
        vaultId: positionId,
        slippage: slippage.toNumber(),
        collateralPrice: collateralPrice.toString(),
        debtPrice: quotePrice.toString(),
        ethPrice: ethPrice.toString(),
        positionType: omniProductTypeToSDKType(productType),
        isOwner,
        pairId,
        triggerData: positionTriggers,
        owner: position.owner,
        lendingProtocol: protocol,
        position,
        dpmProxy,
      })
      refinanceInput = aaveLikeRefinanceInput
      break
  }

  const refinanceContextInput = refinanceInput

  const context: OmniRefinanceContext = useMemo(() => {
    return {
      refinanceContextInput,
    }
  }, [refinanceContextInput])

  return <omniRefinanceContext.Provider value={context}>{children}</omniRefinanceContext.Provider>
}
