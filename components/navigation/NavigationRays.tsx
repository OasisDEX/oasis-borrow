import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { useUserRays } from 'features/rays/hooks/useUserRays'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { rays } from 'theme/icons'
import { Flex, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

export const NavigationRays = () => {
  const { walletAddress } = useAccount()
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[1] - 1}px)`)
  const { Rays } = useAppConfig('features')

  const raysUserData = useUserRays({ walletAddress })

  if (!raysUserData?.userRays || !Rays) {
    return null
  }

  return (
    <Flex sx={{ mr: !isViewBelowL ? 3 : 0, alignItems: 'center' }}>
      <a
        href={`${INTERNAL_LINKS.rays}?userAddress=${walletAddress}`}
        style={{ textDecoration: 'none' }}
      >
        <Flex
          sx={{
            columnGap: 1,
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon icon={rays} size={24} />{' '}
          {!isViewBelowL && (
            <Text variant="boldParagraph3" sx={{ fontSize: 1 }}>
              {
                formatCryptoBalance(new BigNumber(raysUserData?.userRays.allPossiblePoints)).split(
                  '.',
                )[0]
              }{' '}
              Rays
            </Text>
          )}
        </Flex>
      </a>
    </Flex>
  )
}
