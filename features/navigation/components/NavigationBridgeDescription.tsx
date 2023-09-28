import { BaseNetworkNames, networksByName } from 'blockchain/networks'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

export const NavigationBridgeDescription = () => {
  const { t } = useTranslation()

  return (
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
            <Box as="li">
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
  )
}
