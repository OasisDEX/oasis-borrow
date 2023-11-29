import BigNumber from 'bignumber.js'
import { ActionBanner } from 'components/ActionBanner'
import { usePortfolioMatchingAssets } from 'components/portfolio/helpers/usePortfolioMatchingAssets'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { non_owner_notice_icon } from 'theme/icons'
import { Box, Text } from 'theme-ui'

import type { PortfolioWalletAsset } from 'lambdas/lib/shared/src/domain-types'

interface PortfolioNonOwnerNoticeProps {
  address: string
  connectedAssets?: PortfolioWalletAsset[]
  isConnected: boolean
  isOwner: boolean
  ownerAssets?: PortfolioWalletAsset[]
}

function useNoticeCta(isConnected: boolean, hasAssets: boolean) {
  const { t: tPortfolio } = useTranslation('portfolio')

  const { connecting, connect } = useConnection()

  if (!isConnected) {
    return {
      label: tPortfolio('connect'),
      onClick: () => connecting || connect(),
    }
  } else if (hasAssets) {
    return {
      label: tPortfolio('explore'),
      url: INTERNAL_LINKS.earn,
    }
  } else return undefined
}

function useNoticeContent(
  isConnected: boolean,
  {
    connectedAssetsValue = 0,
    ownerAssetsValue = 0,
  }: { connectedAssetsValue?: number; ownerAssetsValue?: number },
) {
  const { t: tPortfolio } = useTranslation('portfolio')

  if (!isConnected) {
    return ownerAssetsValue > 0 ? (
      <Trans
        t={tPortfolio}
        i18nKey="non-owner-notice.disconnected-assets"
        components={{
          span: <Text variant="boldParagraph3" sx={getGradientColor(summerBrandGradient)} />,
        }}
        values={{ amount: formatCryptoBalance(new BigNumber(ownerAssetsValue)) }}
      />
    ) : (
      tPortfolio('non-owner-notice.disconnected-no-assets')
    )
  } else if (isConnected && connectedAssetsValue > 0) {
    return (
      <Trans
        t={tPortfolio}
        i18nKey="non-owner-notice.connected-assets"
        components={{
          span: <Text variant="boldParagraph3" sx={getGradientColor(summerBrandGradient)} />,
        }}
        values={{ amount: formatCryptoBalance(new BigNumber(connectedAssetsValue)) }}
      />
    )
  }
  return undefined
}

export const PortfolioNonOwnerNotice = ({
  address,
  isConnected,
  isOwner,
  connectedAssets,
  ownerAssets,
}: PortfolioNonOwnerNoticeProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const { matchingAssetsValue: connectedAssetsValue } = usePortfolioMatchingAssets({
    assets: connectedAssets,
  })
  const { matchingAssetsValue: ownerAssetsValue } = usePortfolioMatchingAssets({
    assets: ownerAssets,
  })

  const cta = useNoticeCta(isConnected, !!(connectedAssetsValue && connectedAssetsValue > 0))
  const content = useNoticeContent(isConnected, { connectedAssetsValue, ownerAssetsValue })

  return !isConnected || (isConnected && !isOwner) ? (
    <Box sx={{ mb: 4 }}>
      <ActionBanner
        icon={non_owner_notice_icon}
        title={tPortfolio('non-owner-notice.header', { address: formatAddress(address, 6) })}
        cta={cta}
        sx={{
          background: 'linear-gradient(90.61deg, #FFFFFF 0.79%, rgba(255, 255, 255, 0) 99.94%)',
        }}
      >
        {content}
      </ActionBanner>
    </Box>
  ) : (
    <></>
  )
}
