import type { ActionBannerProps } from 'components/ActionBanner'
import { useMigrationBannerMeta } from 'features/migrations/useMigrationBannerMeta'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubFilters } from 'features/productHub/types'
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
  selectedProduct: OmniProductType
}

export const useProductHubBanner = ({
  filters: { protocol },
  selectedProduct,
}: ProductHubBannerProps): ActionBannerProps | undefined => {
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaPoolFinder: ajnaPoolFinderEnabled,
    EnableMigrations: migrationsEnabled,
  } = useAppConfig('features')
  const { t } = useTranslation()
  const { walletAddress } = useAccount()
  const { link, migrationsCount } = useMigrationBannerMeta({
    address: walletAddress,
  })

  if (migrationsCount > 0 && migrationsEnabled) {
    return {
      title: t('product-hub.banners.migration.title', {
        migrationsCount,
      }),
      children: t('product-hub.banners.migration.description'),
      cta: {
        label: t('product-hub.banners.migration.cta'),
        url: link,
      },
      image: staticFilesRuntimeUrl(migrationsIcon),
    }
  }

  if (
    !ajnaSafetySwitchOn &&
    ajnaPoolFinderEnabled &&
    selectedProduct !== OmniProductType.Multiply &&
    (protocol === undefined || protocol?.includes(LendingProtocol.Ajna))
  ) {
    return {
      title: t('product-hub.banners.pool-finder.title'),
      children: t('product-hub.banners.pool-finder.description', {
        product: startCase(selectedProduct),
      }),
      cta: {
        label: t('product-hub.banners.pool-finder.cta'),
        url: `${INTERNAL_LINKS.ajnaPoolFinder}/${selectedProduct}`,
      },
      image: staticFilesRuntimeUrl(poolFinderIcon),
    }
  }

  return undefined
}
