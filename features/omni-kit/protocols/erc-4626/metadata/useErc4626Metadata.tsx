import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { GetOmniMetadata, SupplyMetadata } from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { sparks } from 'theme/icons'

export const useErc4626Metadata: GetOmniMetadata = () => {
  const { t } = useTranslation()

  // TODO: get from feature flags
  const safetySwitch = false
  const suppressValidation = false

  const {
    environment: { label, productType, isOpening },
  } = useOmniGeneralContext()

  // TODO: replace with real validation
  const validations = {
    errors: [],
    hasErrors: false,
    isFormFrozen: false,
    isFormValid: true,
    notices: [],
    successes: [],
    warnings: [],
  }

  // TODO: replace with real notifications
  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Earn:
      return {
        notifications,
        validations,
        handlers: {
          txSuccessEarnHandler: () => {},
        },
        filters: {
          flowStateFilter: () => false,
        },
        values: {
          interestRate: zero,
          isFormEmpty: false,
          sidebarTitle: 'Sidebar',
          footerColumns: isOpening ? 2 : 3,
          headline: label,
          // TODO replace with real values
          headlineDetails: [
            {
              label: t('omni-kit.headline.details.current-apy'),
              value: '0%',
              labelTooltip: 'asd',
              labelIcon: sparks,
            },
            {
              label: t('omni-kit.headline.details.30-days-avg-apy'),
              value: '0%',
            },
            {
              label: t('omni-kit.headline.details.tvl'),
              value: '$0.00',
            },
          ],
          extraDropdownItems: [],
          earnWithdrawMax: zero,
          earnAfterWithdrawMax: zero,
        },
        elements: {
          faq: <>FAQ placeholder</>,
          overviewContent: <>Overview content placeholder</>,
          overviewFooter: <>Overview footer placeholder</>,
          overviewBanner: <>Banner</>,
          earnFormOrder: <>Form order placeholder</>,
          earnFormOrderAsElement: () => <>Form order placeholder</>,
        },
        featureToggles: {
          safetySwitch,
          suppressValidation,
        },
      } as SupplyMetadata
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
    default:
      throw new Error('ERC-4626 supports only Earn')
  }
}
