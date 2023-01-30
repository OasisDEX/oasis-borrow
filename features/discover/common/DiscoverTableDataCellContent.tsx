import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { DiscoverTableDataCellPill } from 'features/discover/common/DiscoverTableDataCellPill'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { parsePillAdditionalData } from 'features/discover/helpers'
import { DiscoverFollow } from 'features/discover/meta'
import { DiscoverTableRowData } from 'features/discover/types'
import {
  getTwitterShareUrl,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import { FollowButtonControl } from 'features/follow/controllers/FollowButtonControl'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

const basePath = getConfig()?.publicRuntimeConfig?.basePath

export function DiscoverTableDataCellContent({
  follow,
  label,
  row,
  onPositionClick,
}: {
  follow?: DiscoverFollow
  label: string
  row: DiscoverTableRowData
  onPositionClick?: (cdpId: string) => void
}) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')
  const { i18n, t } = useTranslation()
  const primitives = Object.keys(row)
    .filter((item) => typeof row[item] === 'string' || typeof row[item] === 'number')
    .reduce<{ [key: string]: string | number }>(
      (a, v) => ({ ...a, [v]: row[v] as string | number }),
      {},
    )

  switch (label) {
    case 'asset':
      const asset = Object.values(discoverFiltersAssetItems).filter(
        (item) => item.value === primitives.asset,
      )[0]

      return (
        <Flex sx={{ alignItems: 'center' }}>
          {follow && primitives.cdpId && (
            <FollowButtonControl
              chainId={follow.chainId}
              followerAddress={follow.followerAddress}
              vaultId={new BigNumber(primitives.cdpId)}
              short
              sx={{
                position: ['absolute', null, null, 'relative'],
                right: [0, null, null, 'auto'],
                mr: ['24px', null, null, 4],
              }}
            />
          )}
          {(primitives.icon || (asset && asset.icon)) && (
            <Icon size={44} name={(primitives.icon || asset.icon) as string} />
          )}
          <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
            <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
              {primitives.ilk ? primitives.ilk : asset ? asset.label : primitives.asset}
            </Text>
            {primitives.cdpId && (
              <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
                {t('position')} #{primitives.cdpId}
              </Text>
            )}
          </Flex>
        </Flex>
      )
    case 'status':
      return (
        <DiscoverTableDataCellPill status={row.status}>
          {t(`discover.table.status.${row.status?.kind}`, {
            ...parsePillAdditionalData(i18n.language, row.status),
          })}
        </DiscoverTableDataCellPill>
      )
    case 'activity':
      return (
        <DiscoverTableDataCellPill activity={row.activity}>
          {t(`discover.table.activity.${row.activity?.kind}`, {
            ...parsePillAdditionalData(i18n.language, row.activity),
          })}
        </DiscoverTableDataCellPill>
      )
    case 'cdpId':
    case 'url':
      return (
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <AppLink
            href={`${row.url || `/${row.cdpId}`}`}
            internalInNewTab={true}
            sx={{ flexGrow: [1, null, null, 'initial'] }}
            onClick={() => {
              onPositionClick && onPositionClick(String(row.url || row.cdpId))
            }}
          >
            <Button className="discover-action" variant="tertiary">
              {t('view')}
            </Button>
          </AppLink>
          {followVaultsEnabled && (
            <AppLink
              href={getTwitterShareUrl({
                text: twitterSharePositionText,
                url: `${basePath}${row.url ? (row.url as string) : `/${row.cdpId}`}`,
                via: twitterSharePositionVia,
              })}
              sx={{ ml: 2 }}
            >
              <Button
                variant="tertiary"
                sx={{ width: '36px', height: '36px', pt: '3px', pr: 0, pb: 0, pl: '2px' }}
              >
                <Icon name="share" size={14} />
              </Button>
            </AppLink>
          )}
        </Flex>
      )
    case 'collateralValue':
    case 'liquidationPrice':
    case 'maxLiquidationAmount':
    case 'netUSDValue':
    case 'nextOsmPrice':
      return <>${formatFiatBalance(new BigNumber(primitives[label]))}</>
    case 'pnl':
    case '30DayAvgApy':
      return (
        <>
          {typeof primitives[label] === 'number'
            ? formatPercent(new BigNumber(primitives[label]), { precision: 2 })
            : primitives[label]}
        </>
      )
    case 'earningsToDate':
    case 'netValue':
    case 'vaultDebt':
      return <>{formatCryptoBalance(new BigNumber(primitives[label]))} DAI</>
    case 'liquidity':
      return (
        <>
          {typeof primitives[label] === 'number' ? (
            <>
              {formatCryptoBalance(new BigNumber(primitives[label]))} {row.liquidityToken || 'DAI'}
            </>
          ) : (
            primitives[label]
          )}
        </>
      )
    case 'currentMultiple':
      return <>{(primitives[label] as number)?.toFixed(2)}x</>
    case 'fundingCost':
    case 'variable':
      return <>{(primitives[label] as number)?.toFixed(2)}%</>
    case 'collateralLocked':
      return (
        <>
          {formatCryptoBalance(new BigNumber(primitives[label]))} {primitives.asset}
        </>
      )
    case 'colRatio':
      return (
        <>
          {row.colRatio && (
            <Text
              as="span"
              sx={{
                color: row.colRatio.isAtRiskDanger
                  ? 'critical100'
                  : row.colRatio.isAtRiskWarning
                  ? 'warning100'
                  : 'success100',
              }}
            >
              {formatPercent(new BigNumber(row.colRatio.level), { precision: 2 })}
            </Text>
          )}
        </>
      )
    case 'protection':
      return (
        <>
          {primitives.cdpId && primitives[label] >= 0 ? (
            <AppLink
              href={`/${primitives.cdpId}`}
              hash={VaultViewMode.Overview}
              internalInNewTab={true}
            >
              <Button
                className="discover-action"
                variant={primitives[label] > 0 ? 'actionActiveGreen' : 'action'}
              >
                {primitives[label] > 0
                  ? t('discover.table.protection-value', { protection: primitives[label] })
                  : t('discover.table.activate')}
              </Button>
            </AppLink>
          ) : (
            <Text as="span" sx={{ fontSize: 2, color: 'neutral80' }}>
              {t('discover.table.not-available')}
            </Text>
          )}
        </>
      )
    default:
      return <>{primitives[label]}</>
  }
}
