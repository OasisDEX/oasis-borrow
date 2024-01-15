import {
  OmniContentCard,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

export const MorphoDetailsSectionContent: FC = () => {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      priceFormat,
      productType,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      values: { changeVariant },
    },
  } = useOmniProductContext(OmniProductType.Borrow || OmniProductType.Multiply)

  const commonContentCardData = {
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice: simulation?.liquidationPrice,
    liquidationPrice: position.liquidationPrice,
    unit: priceFormat,
    ratioToCurrentPrice: one.minus(position.liquidationToMarketPrice),
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: position.riskRatio.loanToValue,
    maxLtv: position.maxRiskRatio.loanToValue,
  })

  const collateralDepositedContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: position.collateralAmount,
    tokensPrice: collateralPrice,
    tokensSymbol: collateralToken,
    translationCardName: 'collateral-deposited',
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: position.debtAmount,
    tokensPrice: quotePrice,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
  })

  return (
    <>
      <OmniContentCard {...commonContentCardData} {...liquidationPriceContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
      {productType === OmniProductType.Borrow && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...collateralDepositedContentCardCommonData}
          />
          <OmniContentCard {...commonContentCardData} {...positionDebtContentCardCommonData} />
        </>
      )}
    </>
  )
}
