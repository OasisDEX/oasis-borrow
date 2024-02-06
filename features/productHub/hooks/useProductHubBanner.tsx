import type { ActionBannerProps } from 'components/ActionBanner'
import type { ProductHubFilters } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import poolFinderIcon from 'public/static/img/product_hub_banners/pool-finder.svg'

interface ProductHubBannerProps {
  filters: ProductHubFilters
  product: ProductHubProductType
}

export const useProductHubBanner = ({
  filters: {
    and: { protocol },
  },
  product,
}: ProductHubBannerProps): ActionBannerProps | undefined => {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, AjnaPoolFinder: ajnaPoolFinderEnabled } =
    useAppConfig('features')
  const { t } = useTranslation()

  if (
    !ajnaSafetySwitchOn &&
    ajnaPoolFinderEnabled &&
    product !== ProductHubProductType.Multiply &&
    (protocol === undefined || protocol?.includes(LendingProtocol.Ajna))
  ) {
    return {
      title: t('product-hub.banners.pool-finder.title'),
      children: t('product-hub.banners.pool-finder.description', {
        product: startCase(product),
      }),
      cta: {
        label: t('product-hub.banners.pool-finder.cta'),
        url: `${INTERNAL_LINKS.ajnaPoolFinder}/${product}`,
      },
      image: staticFilesRuntimeUrl(poolFinderIcon),
    }
  }

  return undefined
}
