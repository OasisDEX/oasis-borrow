import { AjnaFlow, AjnaPoolData, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { DiscoverTableDataCellInactive } from 'features/discover/common/DiscoverTableDataCellContent'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { SxStyleProp } from 'theme-ui'

export function getAjnaWithArrowColorScheme(): SxStyleProp {
  return {
    color: 'interactive100',
    transition: 'color 200ms',
    '&:hover': { color: 'interactive50' },
  }
}

export function getPrimaryButtonLabelKey({
  currentStep,
  dpmAddress,
  flow,
  isTxError,
  isTxSuccess,
  walletAddress,
}: {
  currentStep: AjnaStatusStep
  dpmAddress?: string
  flow: AjnaFlow
  isTxError: boolean
  isTxSuccess: boolean
  product: AjnaProduct
  walletAddress?: string
}): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    case 'transaction':
      if (isTxSuccess && flow === 'open') return 'system.go-to-position'
      else if (isTxError) return 'retry'
      else return 'confirm'
    default:
      if (walletAddress && dpmAddress) return 'confirm'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}

export function filterPoolData({
  data,
  pair,
  product,
}: {
  data: AjnaPoolData
  pair: string
  product: AjnaProduct
}) {
  switch (product) {
    case 'borrow':
      if (Object.keys(data).includes(pair)) {
        const payload = data[pair as keyof typeof data]

        return {
          minPositionSize: `$${formatFiatBalance(payload.minPositionSize)}`,
          maxLtv: formatPercent(payload.maxLtv, { precision: 2 }),
          liquidityAvaliable: `$${formatFiatBalance(payload.liquidityAvaliable)}`,
          annualFee: formatPercent(payload.annualFee, { precision: 2 }),
        }
      } else
        return {
          minPositionSize: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          maxLtv: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          liquidityAvaliable: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          annualFee: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
        }
    case 'earn': {
      if (Object.keys(data).includes(pair)) {
        const payload = data[pair as keyof typeof data]

        return {
          '90DayNetApy': formatPercent(payload['90DayNetApy'], { precision: 2 }),
          '7DayNetApy': formatPercent(payload['7DayNetApy'], { precision: 2 }),
          tvl: `$${formatFiatBalance(payload.tvl)}`,
          minLtv: formatPercent(payload.minLtv, { precision: 2 }),
        }
      } else
        return {
          '90DayNetApy': <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          '7DayNetApy': <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          tvl: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          minLtv: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
        }
    }
    case 'multiply': {
      return {}
    }
  }
}

export function resolveIfCachedPosition<T extends Pick<T, 'position' | 'simulation'>>({
  cached,
  cachedPosition,
  currentPosition,
}: {
  cached: boolean
  cachedPosition?: T
  currentPosition: T
}) {
  return {
    positionData: cached && cachedPosition ? cachedPosition.position : currentPosition.position,
    simulationData:
      cached && cachedPosition ? cachedPosition.simulation : currentPosition.simulation,
  }
}

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
  quoteToken?: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken && {
        header: t(`ajna.${product}.${flow}.headline.header`, { collateralToken, id, quoteToken }),
        token: [collateralToken, quoteToken],
        label: '/static/img/ajna-product-card-label.svg',
      }),
  }
}
