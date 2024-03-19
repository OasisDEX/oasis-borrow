import type { Erc4626Position } from '@oasisdex/dma-library'
import faq from 'features/content/faqs/erc4626/earn/en'
import type {
  GetOmniMetadata,
  ProductContextWithEarn,
  SupplyMetadata,
} from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniIsEarnFormEmpty } from 'features/omni-kit/helpers'
import { Erc4626HeadlineApy } from 'features/omni-kit/protocols/erc-4626/components'
import {
  Erc4626DetailsSectionContent,
  Erc4626DetailsSectionContentAllocation,
  Erc4626DetailsSectionFooter,
} from 'features/omni-kit/protocols/erc-4626/components/details-section'
import {
  Erc4626EstimatedMarketPrice,
  Erc4626FormOrder,
} from 'features/omni-kit/protocols/erc-4626/components/sidebar'
import {
  erc4626FlowStateFilter,
  getErc4626EarnIsFormValid,
} from 'features/omni-kit/protocols/erc-4626/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatDecimalAsPercent, formatUsdValue } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const useErc4626Metadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()

  const {
    Erc4626VaultsSafetySwitch: safetySwitch,
    Erc4626VaultsSuppressValidation: suppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralAddress,
      isOpening,
      label,
      productType,
      protocol,
      quoteAddress,
      quotePrice,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { address: vaultAddress, pricePicker } = erc4626VaultsByName[label as string]

  const validations = productContext.position.simulationCommon.getValidations({
    earnIsFormValid: getErc4626EarnIsFormValid({
      currentStep,
      state: productContext.form.state,
    }),
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.morphoblue,
    safetySwitchOn: safetySwitch,
  })

  switch (productType) {
    case OmniProductType.Earn:
      const castedProductContext = productContext as ProductContextWithEarn

      const position = productContext.position.currentPosition.position as Erc4626Position
      const simulation = productContext.position.currentPosition.simulation as
        | Erc4626Position
        | undefined

      return {
        notifications: [],
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
              protocolRaw: `erc4626-${vaultAddress.toLowerCase()}`,
            }),
        },
        values: {
          interestRate: position.fee?.amount ?? zero,
          isFormEmpty: getOmniIsEarnFormEmpty({
            currentStep,
            state: castedProductContext.form.state,
            txStatus: txDetails?.txStatus,
          }),
          footerColumns: isOpening ? 2 : 3,
          headline: label,
          headlineDetails: [
            {
              label: t('omni-kit.headline.details.current-apy'),
              children: <Erc4626HeadlineApy vaultAddress={vaultAddress} />,
              // value: formatDecimalAsPercent(
              //   getErc4626Apy({
              //     rewardsApy: position.apyFromRewards.per365d,
              //     vaultApy: position.apy.per365d,
              //   }),
              // ),
              // valueTooltip: (
              //   <Erc4626ApyTooltip
              //     rewardsApy={position.apyFromRewards.per365d}
              //     vaultApy={position.apy.per365d}
              //   />
              // ),
            },
            // TODO replace with real values
            {
              label: t('omni-kit.headline.details.30-days-avg-apy'),
              value: formatDecimalAsPercent(position.historicalApy.thirtyDayAverage),
            },
            {
              label: t('omni-kit.headline.details.tvl'),
              value: formatUsdValue(position.tvl.times(quotePrice)),
            },
          ],
          earnWithdrawMax: position.maxWithdrawal,
          earnAfterWithdrawMax: simulation?.maxWithdrawal ?? zero,
        },
        elements: {
          faq,
          overviewContent: <Erc4626DetailsSectionContent />,
          overviewFooter: <Erc4626DetailsSectionFooter />,
          overviewBanner: (
            <>
              <Erc4626DetailsSectionContentAllocation />
              {/* TODO: display rewards */}
            </>
          ),
          overviewWithSimulation: true,
          sidebarContent: pricePicker && <Erc4626EstimatedMarketPrice pricePicker={pricePicker} />,
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
