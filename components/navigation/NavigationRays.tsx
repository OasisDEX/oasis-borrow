import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import type { PortfolioAssetsResponse } from 'components/portfolio/types/domain-types'
import { handleRaysRedirect } from 'features/rays/handleRaysRedirect'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import React, { useEffect, useState } from 'react'
import { rays } from 'theme/icons'
import { Flex, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'
import { useAppConfig } from 'helpers/config'

export const NavigationRays = () => {
  const { walletAddress } = useAccount()
  const [assets, setAssets] = useState<PortfolioAssetsResponse>()
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[1] - 1}px)`)
  const { Rays } = useAppConfig('features')

  useEffect(() => {
    if (walletAddress) {
      void fetch(`/api/portfolio/assets?address=${walletAddress}`)
        .then((res) => res.json())
        .then((data) => setAssets(data))
    }
  }, [walletAddress])

  if (!assets || !Rays) {
    return null
  }

  return (
    <Flex
      sx={{ columnGap: 1, alignItems: 'center', mr: !isViewBelowL ? 3 : 0 }}
      onClick={handleRaysRedirect}
    >
      <Icon icon={rays} size={24} />{' '}
      {!isViewBelowL && (
        <Text variant="boldParagraph3" sx={{ fontSize: 1 }}>
          {formatCryptoBalance(new BigNumber(assets.totalRaysEarned)).split('.')[0]} Rays
        </Text>
      )}
    </Flex>
  )
}
