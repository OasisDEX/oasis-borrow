import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { DiscoverFollow } from 'features/discover/meta'
import { DiscoverTableColRatioRowData } from 'features/discover/types'
import { FollowButtonControl } from 'features/follow/controllers/FollowButtonControl'
import { formatPercent } from 'helpers/formatters/format'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

const discoverTableDataCellProtocolBackgrounds = {
  Aave: 'linear-gradient(229.92deg, #B6509E 15.42%, #2EBAC6 84.42%)',
  Ajna: 'linear-gradient(90deg, #F154DB 0%, #974EEA 100%)',
  Maker: 'linear-gradient(152.36deg, #218F6F 17.19%, #66C5A9 95.07%)',
}

export type DiscoverTableDataCellProtocols = keyof typeof discoverTableDataCellProtocolBackgrounds

export function DiscoverTableDataCellInactive({ children }: PropsWithChildren<{}>) {
  return <Text sx={{ color: 'neutral80' }}>{children}</Text>
}

export function DiscoverTableDataCellAsset({
  address,
  asset,
  follow,
  icon,
  id,
  inactive,
}: {
  address?: string
  asset: string
  follow?: DiscoverFollow
  icon?: string
  id?: number
  inactive?: string
}) {
  const { t } = useTranslation()

  return (
    <Flex sx={{ alignItems: 'center' }}>
      {follow && id && (
        <FollowButtonControl
          chainId={follow.chainId}
          followerAddress={follow.followerAddress}
          vaultId={new BigNumber(id)}
          short
          sx={{
            position: ['absolute', null, null, 'relative'],
            right: [0, null, null, 'auto'],
            mr: ['24px', null, null, 4],
          }}
          protocol={'maker'} //TODO ŁW - update when follow other protocols will be supported
        />
      )}
      {icon && <Icon size={44} name={icon} sx={{ ...(inactive && { opacity: 0.5 }) }} />}
      <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
        <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
          {asset}
          {inactive && (
            <Text as="span" sx={{ fontWeight: 'regular' }}>
              {' '}
              {inactive}
            </Text>
          )}
        </Text>
        {(id || address) && (
          <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
            {t('position')} {id && '#'}
            {id || address}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

export function DiscoverTableDataCellProtocol({
  protocol,
}: {
  protocol: DiscoverTableDataCellProtocols
}) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Box
        sx={{
          width: '10px',
          height: '10px',
          mr: 2,
          borderRadius: 'ellipse',
          background: discoverTableDataCellProtocolBackgrounds[protocol],
        }}
      />
      {protocol}
    </Flex>
  )
}

export function DiscoverTableDataCellRiskRatio({
  level,
  isAtRiskDanger,
  isAtRiskWarning,
}: DiscoverTableColRatioRowData) {
  return (
    <Text
      as="span"
      sx={{
        color: isAtRiskDanger ? 'critical100' : isAtRiskWarning ? 'warning100' : 'success100',
      }}
    >
      {formatPercent(new BigNumber(level), { precision: 2 })}
    </Text>
  )
}
