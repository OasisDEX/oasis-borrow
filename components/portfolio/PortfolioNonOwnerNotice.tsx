import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { usePortfolioMatchingAssets } from 'components/portfolio/helpers/usePortfolioMatchingAssets'
import { Skeleton } from 'components/Skeleton'
import { formatAddress, formatAmount } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { non_owner_notice_icon } from 'theme/icons'
import { Button, Flex, Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

export const PortfolioNonOwnerNotice = ({
  address,
  assets,
}: {
  address: string
  assets?: PortfolioAsset[]
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { matchingAssetsValue } = usePortfolioMatchingAssets({ assets })
  return (
    <Flex
      sx={{
        borderRadius: 'large',
        p: 3,
        background: 'linear-gradient(90.61deg, #FFFFFF 0.79%, rgba(255, 255, 255, 0) 99.94%)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'cardLanding',
        mb: 4,
      }}
    >
      <Icon icon={non_owner_notice_icon} size={60} sx={{ mr: 3 }} />
      <Flex sx={{ flexDirection: 'column', width: '100%' }}>
        <Text variant="boldParagraph2">
          {tPortfolio('non-owner-notice.header', { address: formatAddress(address, 6) })}
        </Text>
        <Text variant="paragraph3">
          {matchingAssetsValue ? (
            <Trans
              t={tPortfolio}
              i18nKey="non-owner-notice.assets-available"
              components={{
                span: <Text variant="boldParagraph3" sx={getGradientColor(summerBrandGradient)} />,
              }}
              values={{ amount: formatAmount(new BigNumber(matchingAssetsValue), 'USD') }}
            />
          ) : (
            <Skeleton width={440} sx={{ mt: 1 }} />
          )}
        </Text>
      </Flex>
      <AppLink href={'/earn'} sx={{ flexShrink: 0, ml: 'auto' }}>
        <Button variant="action">{tPortfolio('explore')}</Button>
      </AppLink>
    </Flex>
  )
}
