import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import type { RefinanceContextInput } from 'features/refinance/contexts'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
import { useAaveLikeRefinanceContextInputs } from 'features/refinance/hooks/useAaveLikeRefinanceContextInputs'
import { useMorphoRefinanceContextInputs } from 'features/refinance/hooks/useMorphoRefinanceContextInputs'
import type { DpmFormState } from 'features/refinance/state/refinanceFormReducto.types'
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
  const collateralAmount = 'collateralAmount' in position ? position.collateralAmount : undefined
  const debtAmount = 'debtAmount' in position ? position.debtAmount : undefined

  const dpm: DpmFormState | undefined = !positionId
    ? undefined
    : {
        address: position.owner,
        id: positionId,
      }

  const refinanceHasAllData =
    positionId &&
    borrowRate &&
    poolId &&
    ltv &&
    maxLtv &&
    liquidationPrice &&
    collateralAmount &&
    debtAmount
  const morphoRefinanceInput = !refinanceHasAllData
    ? undefined
    : useMorphoRefinanceContextInputs({
        address: walletAddress,
        networkId,
        collateralTokenSymbol: collateralToken,
        debtTokenSymbol: quoteToken,
        collateralAmount: collateralAmount.toString(),
        debtAmount: debtAmount.toString(),
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
        owner: position.owner,
        triggerData: positionTriggers,
        dpm,
      })

  const aaveLikeRefinanceInput = !refinanceHasAllData
    ? undefined
    : useAaveLikeRefinanceContextInputs({
        address: walletAddress,
        networkId,
        collateralTokenSymbol: collateralToken,
        debtTokenSymbol: quoteToken,
        collateralAmount: collateralAmount.toString(),
        debtAmount: debtAmount.toString(),
        vaultId: positionId,
        slippage: slippage.toNumber(),
        collateralPrice: collateralPrice.toString(),
        debtPrice: quotePrice.toString(),
        ethPrice: ethPrice.toString(),
        borrowRate: borrowRate.toString(),
        liquidationPrice: liquidationPrice.toString(),
        ltv: ltv.toString(),
        maxLtv: maxLtv.toString(),
        positionType: omniProductTypeToSDKType(productType),
        isOwner,
        pairId,
        owner: position.owner,
        triggerData: positionTriggers,
        lendingProtocol: protocol,
        dpm,
      })

  let refinanceInput: RefinanceContextInput | undefined
  switch (protocol) {
    case LendingProtocol.MorphoBlue:
      refinanceInput = morphoRefinanceInput
      break
    case LendingProtocol.AaveV3:
    case LendingProtocol.SparkV3:
      refinanceInput = aaveLikeRefinanceInput
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
