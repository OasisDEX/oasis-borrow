import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { SimulateTitle } from 'components/SimulateTitle'
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
  getAaveLikeNotifications,
  getAaveLikeSidebarTitle,
} from 'features/omni-kit/protocols/aave-like/helpers'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { useAaveLikeHeadlineDetails } from 'features/omni-kit/protocols/aave-like/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

interface StaticRightBoundaryProps {
  oraclePrice: BigNumber
  priceFormat: string
}

const StaticRightBoundary: FC<StaticRightBoundaryProps> = ({ oraclePrice, priceFormat }) => {
  return (
    <>
      {formatCryptoBalance(oraclePrice)} {priceFormat}
    </>
  )
}

export const useAaveLikeMetadata: GetOmniMetadata = (productContext) => {
  const { t } = useTranslation()

  const {
    AaveV3SafetySwitch: aaveSafetySwitchOn,
    AaveV3SuppressValidation: aaveSuppressValidation,
  } = useAppConfig('features')

  const {
    environment: {
      collateralToken,
      collateralAddress,
      isOracless,
      productType,
      quoteAddress,
      quoteBalance,
      protocol,
      isYieldLoop,
      isOpening,
      quoteToken,
      network,
      priceFormat,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()

  const validations = productContext.position.simulationCommon.getValidations({
    safetySwitchOn: aaveSafetySwitchOn,
    isFormFrozen: false,
    protocolLabel: LendingProtocolLabel.aavev3,
  })

  const notifications: DetailsSectionNotificationItem[] = getAaveLikeNotifications({
    productType,
    auction: productContext.position.positionAuction as AaveHistoryEvent,
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
        isYieldLoop && isOpening
          ? useAaveLikeHeadlineDetails({
              maxRiskRatio: position.maxRiskRatio,
              protocol: protocol as AaveLikeLendingProtocol,
              network: network.name,
            })
          : { headlineDetails: [], isLoading: false }

      return {
        notifications,
        validations,
        handlers: {
          customReset: () => null,
        },
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
          footerColumns: isYieldLoop ? 3 : 2,
          maxSliderAsMaxLtv: true,
          headlineDetails,
          isHeadlineDetailsLoading,
          sliderRightLabel:
            isYieldLoop && t('open-earn.aave.vault-form.configure-multiple.current-price'),
        },
        elements: {
          faq: getAaveLikeFaq({ productType, isYieldLoop, protocol }),
          overviewContent: <AaveLikeDetailsSectionContent />,
          overviewFooter: <AaveLikeDetailsSectionFooter />,
          overviewBanner: getAaveLikeBanner({ protocol, isYieldLoop, collateralToken, quoteToken }),
          overviewTitle: isYieldLoop && isOpening && (
            <SimulateTitle
              token={quoteToken}
              depositAmount={
                productContext.form.state.depositAmount || omniYieldLoopDefaultSimulationDeposit
              }
            />
          ),
          sliderRightBoundary: isYieldLoop && (
            <StaticRightBoundary priceFormat={priceFormat} oraclePrice={position.oraclePrice} />
          ),
        },
        featureToggles: {
          safetySwitch: aaveSafetySwitchOn,
          suppressValidation: aaveSuppressValidation,
        },
      } as LendingMetadata
    case OmniProductType.Earn:
    default:
      throw new Error('Aave does not support Earn')
  }
}
