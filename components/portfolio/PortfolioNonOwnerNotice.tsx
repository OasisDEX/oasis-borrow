import BigNumber from 'bignumber.js'
import { BannerTransparent } from 'components/BannerTransparent'
import { usePortfolioMatchingAssets } from 'components/portfolio/helpers/usePortfolioMatchingAssets'
import { Skeleton } from 'components/Skeleton'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAddress, formatAmount } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { non_owner_notice_icon } from 'theme/icons'
import { Text } from 'theme-ui'

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
    <BannerTransparent
      icon={non_owner_notice_icon}
      title={tPortfolio('non-owner-notice.header', { address: formatAddress(address, 6) })}
      {...(matchingAssetsValue &&
        matchingAssetsValue > 0 && {
          cta: {
            label: tPortfolio('explore'),
            url: INTERNAL_LINKS.earn,
          },
        })}
    >
      <>
        {matchingAssetsValue !== undefined ? (
          <>
            {matchingAssetsValue > 0 && (
              <Trans
                t={tPortfolio}
                i18nKey="non-owner-notice.connected-assets"
                components={{
                  span: (
                    <Text variant="boldParagraph3" sx={getGradientColor(summerBrandGradient)} />
                  ),
                }}
                values={{ amount: formatAmount(new BigNumber(matchingAssetsValue), 'USD') }}
              />
            )}
          </>
        ) : (
          <Skeleton width={440} sx={{ mt: 1, height: '18px' }} />
        )}
      </>
    </BannerTransparent>
  )
}
