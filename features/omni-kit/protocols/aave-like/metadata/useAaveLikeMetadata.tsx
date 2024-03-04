import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { SimulateTitle } from 'components/SimulateTitle'
import { OmniStaticBoundary } from 'features/omni-kit/components/sidebars'
import { omniYieldLoopDefaultSimulationDeposit } from 'features/omni-kit/constants'
import type { GetOmniMetadata, LendingMetadata } from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  getOmniBorrowishChangeVariant,
  getOmniBorrowPaybackMax,
  getOmniIsFormEmpty,
  getOmniIsFormEmptyStateGuard,
} from 'features/omni-kit/helpers'
import {
  AaveLikeDetailsSectionContent,
  AaveLikeDetailsSectionFooter,
} from 'features/omni-kit/protocols/aave-like/components'
import {
  aaveLikeFlowStateFilter,
  getAaveLikeBanner,
  getAaveLikeFaq,
  getAaveLikeFeatureToggle,
  getAaveLikeNotifications,
  getAaveLikeSidebarTitle,
} from 'features/omni-kit/protocols/aave-like/helpers'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { useAaveLikeHeadlineDetails } from 'features/omni-kit/protocols/aave-like/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export const useAaveLikeMetadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()
  const {
    environment: {
      collateralToken,
      collateralAddress,
      isOracless,
      productType,
      quoteAddress,
      quoteBalance,
      protocol,
      isYieldLoopWithData,
      isOpening,
      quoteToken,
      network,
      priceFormat,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const featureToggles = getAaveLikeFeatureToggle(protocol)

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: featureToggles.safetySwitch,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel[protocol],
  })

  const notifications: DetailsSectionNotificationItem[] = getAaveLikeNotifications({
    productType,
    auction: productContext.position.positionAuction as AaveLikeHistoryEvent,
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const position = productContext.position.currentPosition.position as AaveLikePositionV2
      const simulation = productContext.position.currentPosition.simulation as
        | AaveLikePositionV2
        | undefined
      const cachedSimulation = productContext.position.cachedPosition?.simulation as
        | AaveLikePositionV2
        | undefined
      const resolvedSimulation = simulation || cachedSimulation

      const { headlineDetails, isLoading: isHeadlineDetailsLoading } =
        isYieldLoopWithData && isOpening
          ? useAaveLikeHeadlineDetails({
              maxRiskRatio: position.maxRiskRatio,
              protocol: protocol as AaveLikeLendingProtocol,
              network: network.name,
            })
          : { headlineDetails: [], isLoading: false }

      return {
        notifications,
        validations,
        filters: {
          flowStateFilter: (event: CreatePositionEvent) =>
            aaveLikeFlowStateFilter({ collateralAddress, event, productType, quoteAddress }),
        },
        values: {
          interestRate: position.borrowRate,
          isFormEmpty: getOmniIsFormEmpty({
            stateTypeWrapper: getOmniIsFormEmptyStateGuard({
              type: productType,
              state: productContext.form.state,
            }),
            currentStep,
            txStatus: txDetails?.txStatus,
          }),
          afterBuyingPower: simulation?.buyingPower,
          shouldShowDynamicLtv: () => false,
          debtMin: zero,
          debtMax: position.debtAvailable(),
          changeVariant: getOmniBorrowishChangeVariant({ simulation, isOracless }),
          afterAvailableToBorrow: simulation && negativeToZero(simulation.debtAvailable()),
          afterPositionDebt: resolvedSimulation?.debtAmount,
          withdrawMax: position.collateralAvailable,
          paybackMax: getOmniBorrowPaybackMax({
            balance: quoteBalance,
            position,
          }),
          sidebarTitle: getAaveLikeSidebarTitle({
            currentStep,
            productType,
          }),
          footerColumns: isYieldLoopWithData ? 3 : 2,
          maxSliderAsMaxLtv: true,
          headlineDetails,
          isHeadlineDetailsLoading,
          sliderRightLabel:
            isYieldLoopWithData && t('open-earn.aave.vault-form.configure-multiple.current-price'),
        },
        elements: {
          faq: getAaveLikeFaq({ productType, isYieldLoopWithData, protocol }),
          overviewContent: <AaveLikeDetailsSectionContent />,
          overviewFooter: <AaveLikeDetailsSectionFooter />,
          overviewBanner: getAaveLikeBanner({
            protocol,
            isYieldLoopWithData,
            collateralToken,
            quoteToken,
            isOpening,
          }),
          overviewTitle: isYieldLoopWithData && isOpening && (
            <SimulateTitle
              token={quoteToken}
              depositAmount={
                productContext.form.state.depositAmount || omniYieldLoopDefaultSimulationDeposit
              }
            />
          ),
          sliderRightBoundary: isYieldLoopWithData && (
            <OmniStaticBoundary label={priceFormat} value={position.oraclePrice} />
          ),
        },
        featureToggles,
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error(`${protocol} does not support Earn`)
  }
}
