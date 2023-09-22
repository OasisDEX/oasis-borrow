import type { AssetsTableBannerProps } from 'components/assetsTable/types'
import { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import poolFinderIcon from 'public/static/img/product_hub_banners/pool-finder.svg'
import React from 'react'
import { Image } from 'theme-ui'

interface ProductHubBannerProps {
  product: ProductHubProductType
}

export const useProductHubBanner = ({
  product,
}: ProductHubBannerProps): AssetsTableBannerProps | undefined => {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, AjnaPoolFinder: ajnaPoolFinderEnabled } =
    useAppConfig('features')
  const { t } = useTranslation()

  if (!ajnaSafetySwitchOn && ajnaPoolFinderEnabled && product !== ProductHubProductType.Multiply) {
    return {
      title: t('product-hub.banners.pool-finder.title'),
      description: t('product-hub.banners.pool-finder.description', {
        product: startCase(product),
      }),
      cta: t('product-hub.banners.pool-finder.cta'),
      link: `${INTERNAL_LINKS.ajnaPoolFinder}/${product}`,
      icon: <Image src={poolFinderIcon} />,
    }
  }

  return undefined
}
