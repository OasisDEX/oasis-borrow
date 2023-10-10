import { trackingEvents } from 'analytics/trackingEvents'
import BigNumber from 'bignumber.js'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellPill } from 'components/assetsTable/cellComponents/AssetsTableDataCellPill'
import { AssetsTableDataCellRiskRatio } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskRatio'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import type { DiscoverDataResponseRow } from 'features/discover/api'
import { getActivityPillColor } from 'features/discover/helpers/getActivityPillColor'
import { getStatusPillColor } from 'features/discover/helpers/getStatusPillColor'
import type {
  DiscoverPages,
  DiscoverTableActivityRowData,
  DiscoverTableColRatioRowData,
  DiscoverTableStatusRowData,
} from 'features/discover/types'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import type { ReactNode } from 'react'
import React from 'react'
import { Trans } from 'react-i18next'
import { timeAgo } from 'utils'

interface ParseDiscoverCellDataParams {
  chainId?: number
  kind: DiscoverPages
  label: string
  lang: string
  row: DiscoverDataResponseRow
  walletAddress?: string
}

interface parseDiscoverRowDataParams {
  chainId?: number
  kind: DiscoverPages
  lang: string
  rows: DiscoverDataResponseRow[]
  walletAddress?: string
}

function ParseDiscoverCellData({ kind, label, lang, row }: ParseDiscoverCellDataParams): ReactNode {
  const stringified = Object.keys(row)
    .filter((item) => typeof row[item] === 'string' || typeof row[item] === 'number')
    .reduce<{ [key: string]: string }>((a, v) => ({ ...a, [v]: row[v] as string }), {})

  switch (label) {
    case 'asset':
      return (
        <AssetsTableDataCellAsset
          asset={stringified.asset}
          positionId={stringified.cdpId}
          icons={[stringified.asset]}
        />
      )
    case 'collateralValue':
    case 'liquidationPrice':
    case 'maxLiquidationAmount':
    case 'nextOsmPrice':
      return `$${formatFiatBalance(new BigNumber(stringified[label]))}`
    case 'currentMultiple':
      return `${Number(stringified[label])?.toFixed(2)}x`
    case '30DayAvgApy':
    case 'pnl':
      return formatPercent(new BigNumber(stringified[label]), { precision: 2 })
    case 'earningsToDate':
    case 'netValue':
    case 'vaultDebt':
      return `${formatCryptoBalance(new BigNumber(stringified[label]))} DAI`
    case 'colRatio':
      const { isAtRiskDanger, isAtRiskWarning, level } =
        row.colRatio as DiscoverTableColRatioRowData

      return (
        <AssetsTableDataCellRiskRatio
          isAtRiskDanger={isAtRiskDanger}
          isAtRiskWarning={isAtRiskWarning}
          level={level}
        />
      )
    case 'status':
      const status = row.status as DiscoverTableStatusRowData

      return (
        <AssetsTableDataCellPill color={getStatusPillColor(status)}>
          <Trans
            i18nKey={`discover.table.status.${status.kind}`}
            values={{
              tillLiquidation: status.additionalData?.tillLiquidation,
              toStopLoss: status.additionalData?.toStopLoss,
            }}
          />
        </AssetsTableDataCellPill>
      )
    case 'activity':
      const activity = row.activity as DiscoverTableActivityRowData
      return (
        <AssetsTableDataCellPill color={getActivityPillColor(activity)}>
          <Trans
            i18nKey={`discover.table.activity.${activity.kind}`}
            values={{
              timeAgo: timeAgo({
                lang,
                to: new Date(Number(activity.additionalData?.timestamp)),
              }),
            }}
          />
        </AssetsTableDataCellPill>
      )
    case 'cdpId':
      return (
        <AssetsTableDataCellAction
          link={`/${stringified.cdpId}`}
          newTab={true}
          onClick={() => trackingEvents.discover.viewPosition(kind, stringified.cdpId)}
        />
      )
    default:
      return label
  }
}

export function parseDiscoverRowData({
  chainId,
  kind,
  lang,
  rows,
  walletAddress,
}: parseDiscoverRowDataParams): AssetsTableRowData[] {
  return rows.map((row) => {
    return Object.keys(row).reduce<AssetsTableRowData>(
      (a, v) => ({
        ...a,
        [v]: ParseDiscoverCellData({ kind, lang, label: v, row, chainId, walletAddress }),
      }),
      {},
    )
  })
}
