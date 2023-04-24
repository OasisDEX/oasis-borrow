import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { StatefulTooltip } from 'components/Tooltip'
import { AppSpinner } from 'helpers/AppSpinner'
import { displayMultiple } from 'helpers/display-multiple'
import { YieldPeriod } from 'helpers/earn/calculations'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { ProductCardData, productCardsConfig } from 'helpers/productCards'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

import {
  calculateTokenAmount,
  ProductCard,
  ProductCardNetworkRow,
  ProductCardProtocolLink,
} from './ProductCard'

interface UnprofitableTooltipProps {
  value: string
  variant: 'left' | 'right'
}

function UnprofitableSlot({ value, variant }: UnprofitableTooltipProps) {
  const { t } = useTranslation()
  const tooltipSxMap = {
    right: { transform: ['translate(0, 70%)', 'translateX(-24%)'] },
    left: { transform: ['translate(0, 70%)', 'translateX(25%)'] },
  }
  const containerSxMap = {
    right: { justifyContent: 'flex-end' },
    left: { justifyContent: 'flex-start' },
  }

  return (
    <StatefulTooltip
      tooltip={
        <Text sx={{ fontWeight: 'semiBold', mb: 1, fontSize: 2, textAlign: 'left' }}>
          {t('product-card.unprofitable-position')}
        </Text>
      }
      tooltipSx={tooltipSxMap[variant]}
      containerSx={{ alignItems: 'center', ...containerSxMap[variant] }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        {variant === 'right' && <Icon name="error" size={17} sx={{ mr: 1 }} />}
        <Text
          variant="paragraph1"
          sx={{ textAlign: 'right', fontWeight: 'semiBold', color: '#D94A1E' }}
        >
          {value}
        </Text>
        {variant === 'left' && <Icon name="error" size={17} sx={{ ml: 1 }} />}
      </Flex>
    </StatefulTooltip>
  )
}

interface ProductCardEarnMakerProps {
  cardData: ProductCardData
}

export function ProductCardEarnMaker({ cardData }: ProductCardEarnMakerProps) {
  const { t } = useTranslation()
  const defaultDaiValue = new BigNumber(100000)
  const displayNetwork = useFeatureToggle('UseNetworkRowProductCard')
  const { yields$ } = useAppContext()

  const [yields, yieldsError] = useObservable(yields$(cardData.ilk))

  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))
  const tagKey = productCardsConfig.earn.tags[cardData.ilk]

  const title = t(`product-card-title.${cardData.ilk}`)

  const { roundedTokenAmount } = calculateTokenAmount({ ...cardData, balance: defaultDaiValue })

  const sevenDayAverage = yields ? yields.yields[YieldPeriod.Yield7Days]?.value : zero
  const ninetyDayAverage = yields ? yields.yields[YieldPeriod.Yield90Days]?.value : zero

  const yieldSevenDayAsPercentage =
    sevenDayAverage &&
    formatPercent(sevenDayAverage.times(100), {
      precision: 2,
    })
  const yieldNinetyDayAsPercentage =
    ninetyDayAverage &&
    formatPercent(ninetyDayAverage.times(100), {
      precision: 2,
    })
  const getYield = ({
    average,
    yieldsPercentage,
  }: {
    average: BigNumber
    yieldsPercentage: UnprofitableTooltipProps['value']
  }) =>
    average.lt(0) ? <UnprofitableSlot value={yieldsPercentage} variant="left" /> : yieldsPercentage

  const productCardLabels = [
    {
      title: t('system.max-multiple'),
      value: displayMultiple(maxMultiple),
    },
    {
      title: t('system.seven-day-average'),
      value:
        yields && sevenDayAverage && yieldSevenDayAsPercentage ? (
          getYield({ average: sevenDayAverage, yieldsPercentage: yieldSevenDayAsPercentage })
        ) : (
          <AppSpinner />
        ),
    },
    {
      title: t('system.ninety-day-average'),
      value:
        yields && ninetyDayAverage && yieldNinetyDayAsPercentage ? (
          getYield({ average: ninetyDayAverage, yieldsPercentage: yieldNinetyDayAsPercentage })
        ) : (
          <AppSpinner />
        ),
    },
    {
      title: t('system.liquidity-available'),
      value: `${formatCryptoBalance(cardData.liquidityAvailable)}`,
    },
    {
      title: t('system.protocol'),
      value: <ProductCardProtocolLink {...cardData}></ProductCardProtocolLink>,
    },
    {
      title: t('system.network'),
      value: <ProductCardNetworkRow chain={cardData.chain} />,
      enabled: displayNetwork,
    },
  ]

  return (
    <WithErrorHandler error={[yieldsError]}>
      <ProductCard
        key={cardData.ilk}
        tokenImage={cardData.bannerIcon}
        tokenGif={cardData.bannerGif}
        title={title}
        description={t(`product-card.guni.${cardData.ilk}`)}
        banner={{
          title: t('product-card-banner.with', {
            value: roundedTokenAmount.toFormat(0),
            token: 'DAI',
          }),
          description: t(`product-card-banner.guni.${cardData.ilk}`, {
            value: formatCryptoBalance(maxMultiple.times(roundedTokenAmount)),
            token: cardData.token,
          }),
        }}
        labels={productCardLabels}
        button={{
          link: `/earn/open/${cardData.ilk}`,
          text: t('nav.earn'),
        }}
        background={cardData.background}
        inactive={productCardsConfig.earn.inactiveIlks.includes(cardData.ilk)}
        isFull={cardData.isFull}
        floatingLabelText={
          tagKey ? t(`product-card.tags.${tagKey}`, { token: cardData.token }) : ''
        }
        protocol={cardData.protocol}
      />
    </WithErrorHandler>
  )
}
