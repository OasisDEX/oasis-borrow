import type { NetworkIds } from 'blockchain/networks'
import { DefinitionListItem } from 'components/DefinitionList'
import { PositionHistoryItemDetails } from 'components/history/PositionHistoryItemDetails'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import type { AaveHistoryEvent } from 'features/ajna/history/types'
import type {
  AjnaBorrowerEvent,
  AjnaHistoryEvent,
} from 'features/ajna/history/types/AjnaHistoryEvent.types'
import { getHistoryEventLabel } from 'features/positionHistory/getHistoryEventLabel'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useState } from 'react'
import { chevron_down, chevron_up } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'

interface PositionHistoryItemProps {
  collateralToken: string
  etherscanUrl: string
  ethtxUrl: string
  isOracless?: boolean
  isShort?: boolean
  item: Partial<AjnaHistoryEvent> | Partial<AaveHistoryEvent> | Partial<AjnaBorrowerEvent>
  priceFormat?: string
  quoteToken: string
  networkId: NetworkIds
}

export const PositionHistoryItem: FC<PositionHistoryItemProps> = ({
  collateralToken,
  etherscanUrl,
  ethtxUrl,
  isOracless,
  isShort,
  item,
  priceFormat,
  quoteToken,
  networkId,
}) => {
  const [opened, setOpened] = useState(false)
  const { t, i18n } = useTranslation()

  const humanDate = new Date(item.timestamp!).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  return (
    <DefinitionListItem sx={{ fontSize: 2, position: 'relative' }}>
      <Flex
        sx={{
          flexDirection: ['column', null, null, 'row'],
          justifyContent: 'space-between',
          alignItems: ['flex-start', null, null, 'center'],
          width: '100%',
          pb: opened ? 3 : 0,
          pl: 2,
          pr: 4,
          fontSize: 2,
          cursor: 'pointer',
        }}
        onClick={() => setOpened(!opened)}
      >
        <Text as="p" sx={{ fontWeight: 'semiBold', color: 'primary100' }}>
          {getHistoryEventLabel({ kind: item.kind, isOpen: 'isOpen' in item && item.isOpen })}
        </Text>
        <Text as="time" sx={{ color: 'neutral80', whiteSpace: 'nowrap', fontWeight: 'semiBold' }}>
          {humanDate}
        </Text>
        <Icon
          icon={opened ? chevron_up : chevron_down}
          size="auto"
          width="12px"
          height="7px"
          color="neutral80"
          sx={{ position: 'absolute', top: '24px', right: 2 }}
        />
      </Flex>
      {opened && (
        <Box sx={{ pb: 3 }}>
          <PositionHistoryItemDetails
            collateralToken={collateralToken}
            event={item}
            isOracless={isOracless}
            isShort={isShort}
            priceFormat={priceFormat}
            quoteToken={quoteToken}
            networkId={networkId}
          />
          <Flex
            sx={{
              flexDirection: ['column', null, null, 'row'],
              pr: 2,
              pt: 3,
              pl: 3,
            }}
          >
            <AppLink sx={{ textDecoration: 'none' }} href={`${etherscanUrl}/tx/${item.txHash}`}>
              <WithArrow
                sx={{
                  color: 'interactive100',
                  mr: 4,
                  mb: [1, null, null, 0],
                  fontSize: 1,
                  fontWeight: 'semiBold',
                }}
              >
                {t('view-on-etherscan')}
              </WithArrow>
            </AppLink>
            <AppLink sx={{ textDecoration: 'none' }} href={`${ethtxUrl}/${item.txHash}`}>
              <WithArrow sx={{ color: 'interactive100', fontSize: 1, fontWeight: 'semiBold' }}>
                {t('view-on-ethtx')}
              </WithArrow>
            </AppLink>
          </Flex>
        </Box>
      )}
    </DefinitionListItem>
  )
}
