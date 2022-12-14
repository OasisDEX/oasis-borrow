import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getYearlyRate } from 'features/dsr/helpers/dsrPot'
import { redirectState$ } from 'features/router/redirectState'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'

export const dsrLink = '/earn/dsr'

export function ProductCardEarnDsr() {
  const { t } = useTranslation()
  const { connectedContext$, potDsr$, potTotalValueLocked$ } = useAppContext()
  const [potDsr] = useObservable(potDsr$)
  const [potTotalValueLocked] = useObservable(potTotalValueLocked$)
  const [connectedContext] = useObservable(connectedContext$)

  function handleClick() {
    if (!connectedContext) {
      redirectState$.next(dsrLink)
    }
  }

  const apy = potDsr
    ? getYearlyRate(potDsr || zero)
        .decimalPlaces(5, BigNumber.ROUND_UP)
        .minus(1)
    : new BigNumber(0.01)

  const earnUpTo = new BigNumber(100000).times(apy.decimalPlaces(5))

  const link = connectedContext ? `${dsrLink}/${connectedContext.account}` : '/connect'

  return (
    <ProductCard
      tokenImage="/static/img/tokens/maker_dai.png"
      tokenGif="/static/img/tokens/maker_dai.gif"
      title={t(`DAI Savings Rate`)}
      description={t(`dsr.product-card.description`)}
      banner={{
        title: 'With 100,000.00 DAI 👇',
        description: `Earn up to ${formatAmount(earnUpTo, 'USD')} Dai per year`,
      }}
      labels={[
        {
          title: 'Current APY',
          value: formatPercent(apy.times(100), { precision: 2 }),
        },
        {
          title: 'Total Value Locked',
          value: potTotalValueLocked ? formatCryptoBalance(potTotalValueLocked) : 'n/a',
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={'DAI'} protocol="maker" />,
        },
      ]}
      button={{
        link,
        text: t('nav.earn'),
        onClick: handleClick,
      }}
      background="#E0F9F0"
      protocol="maker"
      isFull={false}
    />
  )
}
