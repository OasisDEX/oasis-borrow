import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  OmniCardDataCollateralDepositedModal,
  OmniCardDataLtvModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataNetApy,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { OmniCardDataNetApyModal } from 'features/omni-kit/components/details-section/modals/OmniCardDataNetApyModal'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniNetValuePnlData,
  mapBorrowCumulativesToOmniCumulatives,
} from 'features/omni-kit/helpers'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import {
  useAjnaCardDataBuyingPower,
  useAjnaCardDataNetValueLending,
  useAjnaCardDataThresholdPrice,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { useAjnaCardDataLiquidationPrice } from 'features/omni-kit/protocols/ajna/components/details-section/'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaDetailsSectionContentProps {
  changeVariant: 'positive' | 'negative'
  collateralPrice: BigNumber
  collateralToken: string
  isOpening: boolean
  isOracless: boolean
  isProxyWithManyPositions: boolean
  isShort: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  priceFormat: string
  productType: OmniProductType
  quotePrice: BigNumber
  quoteToken: string
  shouldShowDynamicLtv: boolean
  isYieldLoop: boolean
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionContent: FC<AjnaDetailsSectionContentProps> = ({
  changeVariant,
  collateralPrice,
  collateralToken,
  isOpening,
  isOracless,
  isShort,
  isSimulationLoading,
  position,
  priceFormat,
  productType,
  quotePrice,
  quoteToken,
  shouldShowDynamicLtv,
  simulation,
  isYieldLoop,
}) => {
  const {
    environment: {
      isYieldLoopWithData,
      protocol,
      network,
      collateralPrecision,
      collateralAddress,
      quoteAddress,
    },
  } = useOmniGeneralContext()
  const liquidationPrice = normalizeValue(
    isShort ? one.div(position.liquidationPrice) : position.liquidationPrice,
  )
  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    normalizeValue(isShort ? one.div(simulation.liquidationPrice) : simulation.liquidationPrice)
  const ratioToCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  const netValue = position.collateralAmount
    .times(collateralPrice)
    .minus(position.debtAmount.times(quotePrice))
  const afterNetValue = simulation?.collateralAmount
    .times(collateralPrice)
    .minus(simulation?.debtAmount.times(quotePrice))

  const commonContentCardData = {
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice,
    liquidationPrice,
    unit: priceFormat,
    ...(!isOracless && {
      ratioToCurrentPrice,
    }),
  })
  const liquidationPriceContentCardAjnaData = useAjnaCardDataLiquidationPrice({
    afterLiquidationPrice,
    isOracless,
    liquidationPrice,
    priceFormat,
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: position.riskRatio.loanToValue,
    ...(shouldShowDynamicLtv && { maxLtv: position.maxRiskRatio.loanToValue }),
    modal: (
      <OmniCardDataLtvModal
        ltv={position.riskRatio.loanToValue}
        customCopies={{
          title: 'ajna.content-card.ltv.footnote',
          description: 'ajna.content-card.ltv.modal-footnote-description',
        }}
        {...(shouldShowDynamicLtv && { maxLtv: position.maxRiskRatio.loanToValue })}
      />
    ),
  })
  if (ltvContentCardCommonData.footnote && typeof ltvContentCardCommonData.footnote[0] !== 'string')
    ltvContentCardCommonData.footnote[0].key = 'ajna.content-card.ltv.footnote'

  const thresholdPriceContentCardData = useAjnaCardDataThresholdPrice({
    collateralAmount: position.collateralAmount,
    debtAmount: position.debtAmount,
    afterThresholdPrice: simulation?.thresholdPrice,
    thresholdPrice: position.thresholdPrice,
    unit: priceFormat,
    ...(shouldShowDynamicLtv && { lup: position.pool.lowestUtilizedPrice }),
  })

  const collateralDepositedContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: position.collateralAmount,
    tokensSymbol: collateralToken,
    translationCardName: 'collateral-deposited',
    ...(!isOracless && { tokensPrice: collateralPrice }),
    modal: (
      <OmniCardDataCollateralDepositedModal
        collateralAmount={position.collateralAmount}
        collateralToken={collateralToken}
        theme={ajnaExtensionTheme}
      />
    ),
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: position.debtAmount,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
    ...(!isOracless && { tokensPrice: quotePrice }),
    modal: (
      <OmniCardDataPositionDebtModal
        debtAmount={position.debtAmount}
        quoteToken={quoteToken}
        theme={ajnaExtensionTheme}
      />
    ),
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue,
    netValue,
  })
  const netValueContentCardAjnaData = useAjnaCardDataNetValueLending(
    !isOpening
      ? getOmniNetValuePnlData({
          cumulatives: mapBorrowCumulativesToOmniCumulatives(position.pnl.cumulatives),
          productType,
          collateralTokenPrice: collateralPrice,
          debtTokenPrice: quotePrice,
          netValueInCollateralToken: netValue.div(collateralPrice),
          netValueInDebtToken: netValue.div(quotePrice),
          collateralToken,
          debtToken: quoteToken,
          useDebtTokenAsPnL: isYieldLoop,
        })
      : undefined,
  )

  const buyingPowerContentCardCommonData = useOmniCardDataBuyingPower({
    buyingPower: position.buyingPower,
    collateralPrice,
    collateralToken,
    afterBuyingPower: simulation?.buyingPower,
  })
  const buyingPowerContentCardAjnaData = useAjnaCardDataBuyingPower({
    shouldShowDynamicLtv,
  })

  const simulations = isYieldLoopWithData
    ? useOmniSimulationYields({
        amount: position.collateralAmount.shiftedBy(collateralPrecision),
        token: collateralToken,
        getYields: () =>
          useOmniEarnYields({
            actionSource: 'AjnaLendingDetailsSectionContent',
            ltv: simulation?.riskRatio.loanToValue || position.riskRatio.loanToValue,
            networkId: network.id,
            protocol,
            poolAddress: position.pool.poolAddress,
          }),
      })
    : undefined

  const netApyContentCardCommonData = useOmniCardDataNetApy({
    netApy: simulations?.apy?.div(100),
    modal: (
      <OmniCardDataNetApyModal
        collateralToken={collateralToken}
        quoteToken={quoteToken}
        protocol={LendingProtocolLabel[protocol]}
      />
    ),
  })

  const netValueContentCardData = useAjnaCardDataNetValueLending(
    !isOpening
      ? getOmniNetValuePnlData({
          cumulatives: mapBorrowCumulativesToOmniCumulatives(position.pnl.cumulatives),
          productType,
          collateralTokenPrice: collateralPrice,
          debtTokenPrice: quotePrice,
          netValueInCollateralToken: position.netValue.div(collateralPrice),
          netValueInDebtToken: position.netValue.div(quotePrice),
          collateralToken,
          debtToken: quoteToken,
          useDebtTokenAsPnL: isYieldLoop,
        })
      : undefined,
  )

  if (productType === OmniProductType.Multiply && isYieldLoopWithData) {
    // special case for yield loops
    // TODO: we should refactor ajna components to match aave/morpho
    return (
      <>
        <OmniContentCard
          {...commonContentCardData}
          {...netValueContentCardCommonData}
          {...netValueContentCardData}
        />
        <OmniContentCard {...commonContentCardData} {...netApyContentCardCommonData} />
        <OmniContentCard {...commonContentCardData} {...liquidationPriceContentCardCommonData} />
        <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
      </>
    )
  }

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...liquidationPriceContentCardCommonData}
        {...liquidationPriceContentCardAjnaData}
      />
      {isOracless ? (
        <OmniContentCard {...commonContentCardData} {...thresholdPriceContentCardData} />
      ) : (
        <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
      )}

      {productType === OmniProductType.Borrow && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...collateralDepositedContentCardCommonData}
          />
          <OmniContentCard {...commonContentCardData} {...positionDebtContentCardCommonData} />
        </>
      )}
      {productType === OmniProductType.Multiply && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...netValueContentCardCommonData}
            {...netValueContentCardAjnaData}
          />
          <OmniContentCard
            {...commonContentCardData}
            {...buyingPowerContentCardCommonData}
            {...buyingPowerContentCardAjnaData}
          />
        </>
      )}
    </>
  )
}
