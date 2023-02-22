import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { AjnaBorrowPositionController } from 'features/ajna/borrow/controls/AjnaBorrowPositionController'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { steps } from 'features/ajna/common/consts'
import { AjnaGeneralContextProvider } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { AjnaProductContextProvider } from 'features/ajna/common/contexts/AjnaProductContext'
import { getAjnaHeadlineProps } from 'features/ajna/common/helpers/getAjnaHeadlineProps'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaEarnPositionController } from 'features/ajna/earn/controls/AjnaEarnPositionController'
import { ajnaPositionToAjnaEarnPosition } from 'features/ajna/earn/fakePosition'
import { useAjnaEarnFormReducto } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useRouter } from 'next/router'
import React from 'react'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface AjnaProductControllerOpenFlow {
  collateralToken: string
  product: AjnaProduct
  quoteToken: string
  id?: never
}

interface AjnaProductControllerManageFlow {
  id: string
  collateralToken?: never
  product?: never
  quoteToken?: never
}

type AjnaProductControllerProps = (
  | AjnaProductControllerOpenFlow
  | AjnaProductControllerManageFlow
) & {
  flow: AjnaFlow
}

export function AjnaProductController({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
}: AjnaProductControllerProps) {
  const { push } = useRouter()
  const { ajnaPosition$, balancesInfoArray$, tokenPriceUSD$ } = useAppContext()
  const { walletAddress } = useAccount()

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        ajnaPosition$(
          id
            ? { positionId: getPositionIdentity(id) }
            : {
                collateralToken: collateralToken as string,
                product: product as string,
                quoteToken: quoteToken as string,
              },
        ),
      [id, collateralToken, product, quoteToken],
    ),
  )
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        ajnaPositionData?.meta.collateralToken && ajnaPositionData?.meta.quoteToken
          ? balancesInfoArray$(
              [ajnaPositionData.meta.collateralToken, ajnaPositionData.meta.quoteToken, 'ETH'],
              walletAddress || '',
            )
          : EMPTY,
      [ajnaPositionData],
    ),
  )
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        ajnaPositionData?.meta.collateralToken && ajnaPositionData?.meta.quoteToken
          ? tokenPriceUSD$([
              ajnaPositionData.meta.collateralToken,
              ajnaPositionData.meta.quoteToken,
              'ETH',
            ])
          : EMPTY,
      [ajnaPositionData],
    ),
  )

  if (ajnaPositionData === null) void push('/not-found')

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler
              error={[ajnaPositionError, balancesInfoArrayError, tokenPriceUSDError]}
            >
              <WithLoadingIndicator
                value={[ajnaPositionData, balancesInfoArrayData, tokenPriceUSDData]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaHeadlineProps({
                      collateralToken: ajnaPositionData?.meta.collateralToken,
                      flow,
                      product: ajnaPositionData?.meta.product,
                      quoteToken: ajnaPositionData?.meta.quoteToken,
                      id,
                    })}
                  />
                }
              >
                {([ajnaPosition, [collateralBalance, quoteBalance, ethBalance], tokenPriceUSD]) =>
                  ajnaPosition ? (
                    <AjnaGeneralContextProvider
                      collateralBalance={collateralBalance}
                      collateralPrice={tokenPriceUSD[ajnaPosition.meta.collateralToken]}
                      collateralToken={ajnaPosition.meta.collateralToken}
                      {...(flow === 'manage' && { dpmProxy: ajnaPosition.meta.proxy })}
                      ethBalance={ethBalance}
                      ethPrice={tokenPriceUSD.ETH}
                      flow={flow}
                      id={id}
                      owner={ajnaPosition.meta.user}
                      product={'earn'}
                      quoteBalance={quoteBalance}
                      quotePrice={tokenPriceUSD[ajnaPosition.meta.quoteToken]}
                      quoteToken={ajnaPosition.meta.quoteToken}
                      steps={steps[ajnaPosition.meta.product][flow]}
                    >
                      {/* {ajnaPosition.meta.product === 'borrow' && (
                        <AjnaProductContextProvider
                          formDefaults={{
                            action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                          }}
                          formReducto={useAjnaBorrowFormReducto}
                          position={ajnaPosition.position}
                          product={ajnaPosition.meta.product}
                        >
                          <AjnaBorrowPositionController />
                        </AjnaProductContextProvider>
                      )}
                      {ajnaPosition.meta.product === 'earn' && ( */}
                        <AjnaProductContextProvider
                          formDefaults={{
                            action: flow === 'open' ? 'open-earn' : 'deposit-earn',
                          }}
                          formReducto={useAjnaEarnFormReducto}
                          position={ajnaPositionToAjnaEarnPosition(ajnaPosition.position)}
                          product={'earn'}
                        >
                          <AjnaEarnPositionController />
                        </AjnaProductContextProvider>
                      {/* )} */}
                    </AjnaGeneralContextProvider>
                  ) : (
                    <></>
                  )
                }
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AjnaWrapper>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
