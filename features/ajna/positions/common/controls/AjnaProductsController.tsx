import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { AjnaBorrowPositionController } from 'features/ajna/positions/borrow/controls/AjnaBorrowPositionController'
import { useBorrowFormReducto } from 'features/ajna/positions/borrow/state/borrowFormReducto'
import {
  AjnaCustomStateContextProvider,
  useAjnaCustomState,
} from 'features/ajna/positions/common/contexts/AjnaCustomStateContext'
import {
  GenericProductContextProvider,
  useGenericProductContext,
} from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import type { ProductsControllerProps } from 'features/ajna/positions/common/controls/ProtocolProductController'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import { useAjnaData } from 'features/ajna/positions/common/hooks/useAjnaData'
import { useAjnaTxHandler } from 'features/ajna/positions/common/hooks/useAjnaTxHandler'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getAjnaValidation } from 'features/ajna/positions/common/validation'
import { AjnaEarnPositionController } from 'features/ajna/positions/earn/controls/AjnaEarnPositionController'
import { getAjnaEarnDefaultAction } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultAction'
import { getAjnaEarnDefaultUiDropdown } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultUiDropdown'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import { useEarnFormReducto } from 'features/ajna/positions/earn/state/earnFormReducto'
import { AjnaMultiplyPositionController } from 'features/ajna/positions/multiply/controls/AjnaMultiplyPositionController'
import { useMultiplyFormReducto } from 'features/ajna/positions/multiply/state/multiplyFormReducto'
import type { ProtocolProduct } from 'features/unifiedProtocol/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import type { FC } from 'react'
import React from 'react'

export const useAjnaMetadata = (product: ProtocolProduct) => {
  const generalContext = useProtocolGeneralContext()
  const productContext = useGenericProductContext(product)
  const customState = useAjnaCustomState()
  console.log('customState', customState)

  console.log({
    generalContext,
    productContext,
    customState,
  })

  return {
    txHandler: useAjnaTxHandler(),
  }
}

// copies, vaalidations, in general things that does not require product context
const staticMetadata = {
  getValidation: getAjnaValidation,
  getNotifications: getAjnaNotifications,
  customHehe: {
    zelipapo: 'papo',
    extraInput: (
      <VaultActionInput
        action="deposit"
        currencyCode="USDC"
        hasError={false}
        onChange={() => null}
      />
    ),
  },
}

export const AjnaProductsController: FC<ProductsControllerProps> = ({
  dpmPosition,
  product,
  flow,
  tokenPriceUSD,
  quoteToken,
  collateralToken,
  protocol,
  tokensIcons,
  id,
}) => {
  const {
    data: { aggregatedData, positionData },
    errors,
  } = useAjnaData({
    collateralToken,
    id,
    product,
    quoteToken,
    tokenPriceUSDData: tokenPriceUSD,
    dpmPositionData: dpmPosition,
    protocol,
  })

  return (
    <WithErrorHandler error={errors}>
      <WithLoadingIndicator
        value={[positionData, aggregatedData]}
        customLoader={
          <PositionLoadingState
            {...getAjnaHeadlineProps({
              collateralToken: dpmPosition.collateralToken,
              flow,
              product: dpmPosition.product as ProtocolProduct,
              quoteToken: dpmPosition.quoteToken,
              collateralIcon: tokensIcons.collateralToken,
              quoteIcon: tokensIcons.quoteToken,
              id,
            })}
          />
        }
      >
        {([position, { history, auction }]) => (
          <>
            {dpmPosition.product === 'borrow' && (
              <AjnaCustomStateContextProvider>
                <GenericProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                  }}
                  formReducto={useBorrowFormReducto}
                  position={position as AjnaPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaBorrowishPositionAuction}
                  positionHistory={history}
                >
                  <AjnaBorrowPositionController />
                </GenericProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
            {dpmPosition.product === 'earn' && (
              <AjnaCustomStateContextProvider>
                <GenericProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: getAjnaEarnDefaultAction(flow, position as AjnaEarnPosition),
                    uiDropdown: getAjnaEarnDefaultUiDropdown(position as AjnaEarnPosition),
                    price: getEarnDefaultPrice(position as AjnaEarnPosition),
                  }}
                  formReducto={useEarnFormReducto}
                  position={position as AjnaEarnPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaEarnPositionAuction}
                  positionHistory={history}
                >
                  <AjnaEarnPositionController />
                </GenericProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
            {dpmPosition.product === 'multiply' && (
              <AjnaCustomStateContextProvider>
                <GenericProductContextProvider
                  staticMetadata={staticMetadata}
                  dynamicMetadata={useAjnaMetadata}
                  formDefaults={{
                    action: flow === 'open' ? 'open-multiply' : 'adjust',
                  }}
                  formReducto={useMultiplyFormReducto}
                  position={position as AjnaPosition}
                  product={dpmPosition.product}
                  positionAuction={auction as AjnaBorrowishPositionAuction}
                  positionHistory={history}
                >
                  <AjnaMultiplyPositionController />
                </GenericProductContextProvider>
              </AjnaCustomStateContextProvider>
            )}
          </>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
