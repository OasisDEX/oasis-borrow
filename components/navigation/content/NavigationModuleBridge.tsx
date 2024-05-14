import { BaseNetworkNames, networksByName } from 'blockchain/networks'
import { NavigationMenuDropdownContentListItem } from 'components/navigation/NavigationMenuDropdownContentListItem'
import type { SwapWidgetChangeAction } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { uiChanges } from 'helpers/uiChanges'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { bridge } from 'theme/icons'
import { Box, Flex, Image } from 'theme-ui'

export const NavigationModuleBridge: FC = () => {
  const { t } = useTranslation()

  const { connect } = useConnection()

  return (
    <NavigationMenuDropdownContentListItem
      title={t('nav.bridge')}
      description={
        <>
          {t('nav.bridge-description')}
          <Flex
            as="ul"
            sx={{
              mt: '14px',
              ml: 0,
              p: 0,
              listStyle: 'none',
              columnGap: '14px',
            }}
          >
            {[BaseNetworkNames.Ethereum, BaseNetworkNames.Optimism, BaseNetworkNames.Arbitrum].map(
              (network) => (
                <Box as="li" key={network}>
                  <Image
                    src={networksByName[network].icon}
                    width={20}
                    sx={{ verticalAlign: 'bottom' }}
                  />
                </Box>
              ),
            )}
          </Flex>
        </>
      }
      icon={{
        position: 'global',
        icon: bridge,
      }}
      onClick={() => {
        connect()
        uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
          type: 'open',
          variant: 'bridge',
        })
      }}
    />
  )
}
