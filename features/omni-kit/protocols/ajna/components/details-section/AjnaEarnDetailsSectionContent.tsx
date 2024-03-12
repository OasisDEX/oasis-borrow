import { type AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  OmniContentCard,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  useAjnaCardDataMaxLendingLtv,
  useAjnaCardDataNetValueEarn,
  useAjnaCardDataPositionLendingPrice,
  useAjnaCardDataTotalEarnings,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { getAjnaSimulationRows } from 'features/omni-kit/protocols/ajna/helpers'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface AjnaEarnDetailsSectionContentProps {
  depositAmount?: BigNumber
  isOpening: boolean
  isOracless: boolean
  isProxyWithManyPositions: boolean
  isShort: boolean
  isSimulationLoading?: boolean
  position: AjnaEarnPosition
  priceFormat: string
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaEarnPosition
}

export const AjnaEarnDetailsSectionContent: FC<AjnaEarnDetailsSectionContentProps> = ({
  depositAmount,
  isOpening,
  isOracless,
  isShort,
  isSimulationLoading,
  position,
  priceFormat,
  quotePrice,
  quoteToken,
  simulation,
}) => {
  const { t } = useTranslation()

  const rowsInput = [
    {
      apy: simulation?.apy.per1d,
      translation: t('omni-kit.position-page.earn.open.earnings-per-1d'),
    },
    {
      apy: simulation?.apy.per30d,
      translation: t('omni-kit.position-page.earn.open.earnings-per-30d'),
    },
    {
      apy: simulation?.apy.per365d,
      translation: t('omni-kit.position-page.earn.open.earnings-per-365d'),
    },
  ]

  const commonContentCardData = {
    isLoading: isSimulationLoading,
  }
  const totalEarningsContentCardAjnaData = useAjnaCardDataTotalEarnings({
    quoteToken,
    withoutFees: position.totalEarnings.withoutFees,
    ...(!isOracless && {
      pnlUSD: position.pnl.withoutFees,
      withFees: position.totalEarnings.withFees,
    }),
  })

  const netValueContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.quoteTokenAmount,
    tokensAmount: position.quoteTokenAmount,
    tokensSymbol: quoteToken,
    translationCardName: 'net-value',
    ...(!isOracless && { tokensPrice: quotePrice }),
  })
  const netValueContentCardAjnaData = useAjnaCardDataNetValueEarn({
    netValue: position.quoteTokenAmount,
    quoteToken,
  })

  const maxLendingLtvContentCardAjnaData = useAjnaCardDataMaxLendingLtv({
    afterMaxLtv: simulation?.maxRiskRatio.loanToValue,
    maxLtv: position.maxRiskRatio.loanToValue,
  })

  const positionLendingPriceContentCardAjnaData = useAjnaCardDataPositionLendingPrice({
    afterLendingPrice: simulation?.price,
    highestThresholdPrice: position.pool.highestThresholdPrice,
    isLoading: isSimulationLoading,
    isOracless,
    isShort,
    lendingPrice: position.price,
    lowestUtilizedPrice: position.pool.lowestUtilizedPrice,
    priceFormat,
    quoteToken,
  })

  return (
    <>
      {isOpening && (
        <DetailsSectionContentTable
          headers={[
            t('omni-kit.position-page.earn.open.duration'),
            t('omni-kit.position-page.earn.open.estimated-earnings'),
            t('omni-kit.position-page.earn.open.net-value'),
          ]}
          rows={getAjnaSimulationRows({ rowsInput, quoteToken, depositAmount })}
          footnote={<>{t('omni-kit.position-page.earn.open.disclaimer')}</>}
        />
      )}
      {!isOpening && (
        <>
          <OmniContentCard {...totalEarningsContentCardAjnaData} />
          <OmniContentCard
            {...commonContentCardData}
            {...netValueContentCardCommonData}
            {...netValueContentCardAjnaData}
          />
          {!isOracless && (
            <OmniContentCard {...commonContentCardData} {...maxLendingLtvContentCardAjnaData} />
          )}
          <OmniContentCard
            {...commonContentCardData}
            {...positionLendingPriceContentCardAjnaData}
          />
        </>
      )}
    </>
  )
}
