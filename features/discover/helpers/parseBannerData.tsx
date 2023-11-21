import type { ActionBannerProps } from 'components/ActionBanner'
import type { DiscoverPageMeta } from 'features/discover/meta'
import { useTranslation } from 'react-i18next'

interface ParseBannerDataParams {
  banner: DiscoverPageMeta['banner']
  onClick?: () => void
}

export function parseBannerData({
  banner: { cta, description, link, title, icon },
  onClick,
}: ParseBannerDataParams): ActionBannerProps {
  const { t } = useTranslation()

  return {
    children: t(description),
    title: t(title),
    cta: {
      label: t(cta),
      url: link,
      onClick,
      targetBlank: true,
    },
    icon,
  }
}
