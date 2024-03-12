import type { Erc4626Position } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import faq from 'features/content/faqs/erc4626/earn/en'
import type {
  GetOmniMetadata,
  ProductContextWithEarn,
  SupplyMetadata,
} from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniIsEarnFormEmpty } from 'features/omni-kit/helpers'
import {
  Erc4626DetailsSectionContent,
  Erc4626DetailsSectionFooter,
  Erc4626VaultAllocation,
} from 'features/omni-kit/protocols/erc-4626/components/details-section'
import {
  Erc4626EstimatedMarketCap,
  Erc4626FormOrder,
} from 'features/omni-kit/protocols/erc-4626/components/sidebar'
import { erc4626FlowStateFilter } from 'features/omni-kit/protocols/erc-4626/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { sparks } from 'theme/icons'

export const useErc4626Metadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()

  // TODO: get from feature flags
  const safetySwitch = false
  const suppressValidation = false

  const {
    environment: {
      collateralAddress,
      isOpening,
      label,
      productType,
      protocol,
      quoteAddress,
      quotePrice,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { address: vaultAddress } = erc4626VaultsByName[label as string]

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: safetySwitch,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.morphoblue,
  })

  // TODO: replace with real notifications
  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Earn:
      const castedProductContext = productContext as ProductContextWithEarn

      const position = productContext.position.currentPosition.position as Erc4626Position
      const simulation = productContext.position.currentPosition.simulation as
        | Erc4626Position
        | undefined

      return {
        notifications,
        validations,
        handlers: {},
        filters: {
          flowStateFilter: (event) =>
            erc4626FlowStateFilter({
              collateralAddress,
              event,
              productType,
              quoteAddress,
              protocol,
              protocolRaw: `erc4626-${vaultAddress}`,
            }),
        },
        values: {
          interestRate: position.fee?.amount.div(100) ?? zero,
          isFormEmpty: getOmniIsEarnFormEmpty({
            currentStep,
            state: castedProductContext.form.state,
            txStatus: txDetails?.txStatus,
          }),
          footerColumns: isOpening ? 2 : 3,
          headline: label,
          // TODO replace with real values
          headlineDetails: [
            {
              label: t('omni-kit.headline.details.current-apy'),
              value: '0%',
              labelTooltip: 'Tooltip placeholder',
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
          earnWithdrawMax: position.maxWithdrawal,
          earnAfterWithdrawMax: simulation?.maxWithdrawal ?? zero,
        },
        elements: {
          faq,
          overviewContent: <Erc4626DetailsSectionContent />,
          overviewFooter: <Erc4626DetailsSectionFooter />,
          overviewBanner: (
            <>
              <Erc4626VaultAllocation
                supplyTokenPrice={quotePrice}
                supplyTokenSymbol={quoteToken}
                tokens={[
                  {
                    supply: new BigNumber(13493403),
                    tokenSymbol: 'WSTETH',
                    maxLtv: new BigNumber(0.886),
                  },
                  {
                    supply: new BigNumber(3443490),
                    tokenSymbol: 'WBTC',
                    maxLtv: new BigNumber(0.862),
                  },
                ]}
              />
            </>
          ),
          overviewWithSimulation: true,
          // TODO: show only when rewards are available in vault
          sidebarContent: <Erc4626EstimatedMarketCap token="MORPHO" />,
          earnFormOrder: <Erc4626FormOrder />,
          earnFormOrderAsElement: Erc4626FormOrder,
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
