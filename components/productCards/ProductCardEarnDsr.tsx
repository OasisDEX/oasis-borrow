import { useAppContext } from 'components/AppContextProvider'
import { redirectState$ } from 'features/router/redirectState'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'

export const dsrLink = '/earn/dsr'

export function ProductCardEarnDsr() {
  const { t } = useTranslation()
  const { connectedContext$ } = useAppContext()
  const [connectedContext] = useObservable(connectedContext$)

  function handleClick() {
    if (!connectedContext) {
      redirectState$.next(dsrLink)
    }
  }

  const link = connectedContext ? `${dsrLink}/${connectedContext.account}` : '/connect'

  return (
    <ProductCard
      tokenImage="/static/img/tokens/maker_dai.png"
      tokenGif="/static/img/tokens/maker_dai.gif"
      title={t(`DAI Savings Rate`)}
      description={t(`dsr.product-card.description`)}
      banner={{
        title: 'With 100,000.00 DAI 👇',
        description: 'Earn up to 1,000 Dai per year',
      }}
      labels={[
        {
          title: 'Current APY',
          value: '1.00%',
        },
        {
          title: 'Total Value Locked',
          value: '125.04m',
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={'DAI'} protocol="maker" />,
        },
      ]}
      button={{
        // TODO: Add the correct link here. Needs to be /earn/dsr/{walletAddress}
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
