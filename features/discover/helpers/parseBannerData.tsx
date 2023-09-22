import type { AssetsTableBannerProps } from 'components/assetsTable/types'
import { useTranslation } from 'react-i18next'

interface ParseBannerDataParams {
  banner: AssetsTableBannerProps
  onClick?: () => void
}

export function parseBannerData({
  banner: { cta, description, title, ...rest },
  onClick,
}: ParseBannerDataParams): AssetsTableBannerProps {
  const { t } = useTranslation()

  return {
    cta: t(cta),
    description: t(description),
    title: t(title),
    onClick,
    ...rest,
  }
}
