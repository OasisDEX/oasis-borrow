import BigNumber from 'bignumber.js'
import { AssetsTableFollowButtonProps } from 'components/assetsTable/types'
import { TokensGroup } from 'components/TokensGroup'
import { FollowButtonControl } from 'features/follow/controllers/FollowButtonControl'
import { allDefined } from 'helpers/allDefined'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'theme-ui'

interface AssetsTableDataCellAssetProps {
  asset: string
  followButton?: AssetsTableFollowButtonProps
  icons?: string[]
  positionId?: string
  prefix?: string
  suffix?: string
}

export function AssetsTableDataCellAsset({
  asset,
  followButton,
  icons = [],
  positionId,
  prefix,
  suffix,
}: AssetsTableDataCellAssetProps) {
  const { t } = useTranslation()

  return (
    <Flex sx={{ alignItems: 'center' }}>
      {followButton && positionId && (
        <FollowButtonControl
          chainId={followButton.chainId}
          followerAddress={followButton.followerAddress}
          vaultId={new BigNumber(positionId)}
          short
          sx={{
            position: ['absolute', null, null, 'relative'],
            right: [0, null, null, 'auto'],
            mr: ['24px', null, null, 4],
          }}
          protocol="maker" //TODO ŁW - update when follow other protocols will be supported
        />
      )}
      {icons.length > 0 && allDefined(...icons) && <TokensGroup tokens={icons} />}
      <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
        <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
          {prefix && (
            <Text as="span" sx={{ fontWeight: 'regular' }}>
              {prefix}{' '}
            </Text>
          )}
          {asset}
          {suffix && (
            <Text as="span" sx={{ fontWeight: 'regular' }}>
              {' '}
              {suffix}
            </Text>
          )}
        </Text>
        {positionId && (
          <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
            {t('position')} {!positionId.toString().includes('...') && '#'}
            {positionId}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
