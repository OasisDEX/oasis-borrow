import { Icon } from '@makerdao/dai-ui-icons'
import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { getAaveStrategy } from 'features/aave/strategyConfig'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard, ProductCardNetworkRow, ProductCardProtocolLink } from './ProductCard'
import { ProductCardsLoader } from './ProductCardsWrapper'

type ProductCardBorrowAaveProps = {
  cardData: TokenMetadataType
}

const aaveEarnCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardBorrowAave({ cardData }: ProductCardBorrowAaveProps) {
  const { t } = useTranslation()
  const { aaveReserveConfigurationData$, aaveAvailableLiquidityInUSDC$, getAaveAssetsPrices$ } =
    useAaveContext()
  const [strategy] = getAaveStrategy(cardData.symbol)
  const displayNetwork = useFeatureToggle('UseNetworkRowProductCard')
  const [aaveReserveState, aaveReserveStateError] = useObservable(
    aaveReserveConfigurationData$({ token: strategy.tokens.collateral }),
  )
  const [aaveAvailableLiquidityETH, aaveAvailableLiquidityETHError] = useObservable(
    aaveAvailableLiquidityInUSDC$({ token: 'ETH' }),
  )
  const [aaveUSDCPrice] = useObservable(getAaveAssetsPrices$({ tokens: ['USDC'] }))

  const maximumLoanToValue =
    aaveReserveState?.ltv && new RiskRatio(aaveReserveState.ltv, RiskRatio.TYPE.LTV)

  return (
    <WithErrorHandler error={[aaveReserveStateError, aaveAvailableLiquidityETHError]}>
      <WithLoadingIndicator
        value={[aaveReserveState, aaveAvailableLiquidityETH, maximumLoanToValue, aaveUSDCPrice]}
        customLoader={<ProductCardsLoader />}
      >
        {([_aaveReserveState, _availableLiquidity, _maximumLoanToValue, _aaveUSDCPrice]) => (
          <ProductCard
            tokenImage={cardData.bannerIcon}
            tokenGif={cardData.bannerGif}
            title={t(`product-card.aave.${cardData.symbol}.title`)}
            description={t(`product-card.aave.${cardData.symbol}.description`)}
            banner={{
              title: t('product-card-banner.with', {
                value: aaveEarnCalcValueBasis.amount.toString(),
                token: aaveEarnCalcValueBasis.token,
              }),
              description: t(`product-card-banner.aave.${cardData.symbol}`, {
                value: _maximumLoanToValue.loanToValue
                  .times(aaveEarnCalcValueBasis.amount)
                  .div(_aaveUSDCPrice[0])
                  .toFormat(0),
                token: cardData.symbol,
              }),
            }}
            labels={[
              {
                title: t('system.max-loan-to-value'),
                value: formatDecimalAsPercent(_maximumLoanToValue.loanToValue),
              },
              {
                title: t('product-card.aave.tokens-for-borrowing'),
                value: <Icon name={`usdc`} size="26px" sx={{ mr: 2 }} />,
              },
              {
                title: t('system.protocol'),
                value: (
                  <ProductCardProtocolLink ilk={cardData.symbol} protocol={cardData.protocol} />
                ),
              },
              {
                title: t('system.network'),
                value: <ProductCardNetworkRow chain={cardData.chain} />,
                enabled: displayNetwork,
              },
            ]}
            button={{
              link: `/borrow/aave/open/${cardData.symbol}`,
              text: t('nav.borrow'),
            }}
            background={cardData.background}
            protocol={cardData.protocol}
            isFull={false}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
