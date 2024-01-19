import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import type { GetOmniMetadata, SupplyMetadata } from 'features/omni-kit/contexts'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { SimpleEarnFooter } from 'features/omni-kit/protocols/aave-like/components/SimpleEarnFooter'
import { SimpleEarnHeader } from 'features/omni-kit/protocols/aave-like/components/SimpleEarnHeader'
import { SimpleEarnOverview } from 'features/omni-kit/protocols/aave-like/components/SimpleEarnOverview'
import { useAaveLikeSidebarTitle } from 'features/omni-kit/protocols/aave-like/hooks/useAaveLikeSidebarTitle'
import type { AaveSimpleSupplyPosition } from 'features/omni-kit/protocols/aave-like/types/AaveSimpleSupply'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

export const useAaveLikeSimpleEarnMetadata: GetOmniMetadata = (productContext) => {
  const {
    AaveLikeSimpleEarnSafetySwitch: aaveLikeSimpleEarnSafetySwitchOn,
    AaveLikeSimpleEarnSuppressValidation: aaveLikeSimpleEarnSuppressValidation,
  } = useAppConfig('features')
  const {
    environment: { productType },
    steps: { currentStep },
  } = useOmniGeneralContext()

  const validations = {
    isFormValid: true,
    hasErrors: false,
    isFormFrozen: false,
    errors: [],
    warnings: [],
    notices: [],
    successes: [],
  }

  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Earn:
      const position = productContext.position.currentPosition.position as AaveSimpleSupplyPosition
      const simulation = productContext.position.currentPosition.simulation as
        | AaveSimpleSupplyPosition
        | undefined

      const TempFormOrder = () => <div>Form order</div>
      console.log('position', position)
      console.log('simulation', simulation)

      return {
        notifications,
        validations,
        handlers: {
          customReset: () => null,
          txSuccessEarnHandler: () => null,
        },
        filters: {
          flowStateFilter: (event: CreatePositionEvent) => {
            return (
              extractLendingProtocolFromPositionCreatedEvent(event) === LendingProtocol.AaveV3 &&
              (event.args.positionType.toLocaleLowerCase() as OmniProductType) ===
                OmniProductType.Earn
            )
          },
        },
        values: {
          interestRate: zero,
          isFormEmpty: true,
          afterBuyingPower: zero,
          shouldShowDynamicLtv: () => true,
          debtMin: zero,
          debtMax: zero,
          changeVariant: '',
          paybackMax: zero,
          sidebarTitle: useAaveLikeSidebarTitle({
            currentStep,
            productType,
          }),
          footerColumns: 2,
          earnWithdrawMax: zero,
        },
        elements: {
          faq: <></>,
          highlighterOrderInformation: undefined,
          overviewHeader: <SimpleEarnHeader />,
          overviewContent: <SimpleEarnOverview />,
          overviewFooter: <SimpleEarnFooter />,
          earnFormOrder: TempFormOrder,
          earnFormOrderAsElement: () => <TempFormOrder />,
        },
        featureToggles: {
          safetySwitch: aaveLikeSimpleEarnSafetySwitchOn,
          suppressValidation: aaveLikeSimpleEarnSuppressValidation,
        },
      } as SupplyMetadata

    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
    default:
      throw new Error('Aave Simple deposit does not support borrow/multiply')
  }
}
