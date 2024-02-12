import type { ActionBannerProps } from 'components/ActionBanner'
import { useMigrationBannerMeta } from 'features/migrations/useMigrationBannerMeta'
import type { ProductHubFilters } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import migrationsIcon from 'public/static/img/product_hub_banners/migrations_banner.svg'
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
  const { walletAddress } = useAccount()
  const { biggestPositionLink, migrationsCount } = useMigrationBannerMeta({
    address: walletAddress,
  })

  if (migrationsCount > 0 && biggestPositionLink) {
    return {
      title: t('product-hub.banners.migration.title', {
        migrationsCount,
      }),
      children: t('product-hub.banners.migration.description'),
      cta: {
        label: t('product-hub.banners.migration.cta'),
        url: biggestPositionLink,
      },
      image: staticFilesRuntimeUrl(migrationsIcon),
    }
  }

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
