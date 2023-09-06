import React from 'react'
import { useTranslation } from 'react-i18next'
import { TokensGroup } from 'components/TokensGroup'
import { allDefined } from 'helpers/allDefined'
import { Flex, Text } from 'theme-ui'

interface AssetsTableDataCellAssetProps {
  asset: string
  icons?: string[]
  positionId?: string
  prefix?: string
  suffix?: string
}

export function AssetsTableDataCellAsset({
  asset,
  icons = [],
  positionId,
  prefix,
  suffix,
}: AssetsTableDataCellAssetProps) {
  const { t } = useTranslation()

  return (
    <Flex sx={{ alignItems: 'center' }}>
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
