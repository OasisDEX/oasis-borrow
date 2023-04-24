import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getYearlyRate } from 'features/dsr/helpers/dsrPot'
import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { MainNetworkNames } from 'helpers/networkNames'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo } from 'react'

import { ProductCard, ProductCardNetworkRow, ProductCardProtocolLink } from './ProductCard'

export function ProductCardEarnDsr() {
  const { t } = useTranslation()
  const displayNetwork = useFeatureToggle('UseNetworkRowProductCard')
  const { connectedContext$, potDsr$, potTotalValueLocked$ } = useAppContext()
  const [potDsr] = useObservable(potDsr$)
  const [potTotalValueLocked] = useObservable(potTotalValueLocked$)
  const [connectedContext] = useObservable(connectedContext$)
  const { executeConnection } = useWeb3OnBoardConnection({ walletConnect: true })
  const { push } = useRedirect()

  const handleClick = useCallback(async () => {
    if (!connectedContext) {
      await executeConnection((account) => push(`${INTERNAL_LINKS.earnDSR}/${account}`))
    }
  }, [connectedContext, executeConnection, push])

  const apy = potDsr
    ? getYearlyRate(potDsr || zero)
        .decimalPlaces(5, BigNumber.ROUND_UP)
        .minus(1)
    : new BigNumber(0.01)

  const earnUpTo = new BigNumber(100000).times(apy.decimalPlaces(5))

  const link = useMemo(
    () => connectedContext && `${INTERNAL_LINKS.earnDSR}/${connectedContext.account}`,
    [connectedContext],
  )

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
        {
          title: t('system.network'),
          value: <ProductCardNetworkRow chain={MainNetworkNames.ethereumMainnet} />, // could be read from the context
          enabled: displayNetwork,
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
