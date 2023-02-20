import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { AjnaBorrowContextProvider } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaBorrowView } from 'features/ajna/borrow/views/AjnaBorrowView'
import { steps } from 'features/ajna/common/consts'
import { getAjnaHeadlineProps } from 'features/ajna/common/helpers'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaGeneralContextProvider } from 'features/ajna/contexts/AjnaGeneralContext'
import { AjnaProductContextProvider } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaEarnView } from 'features/ajna/earn/views/AjnaEarnView'
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

  if (ajnaPositionData === null) void push('/404')

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
                      product={ajnaPosition.meta.product}
                      quoteBalance={quoteBalance}
                      quotePrice={tokenPriceUSD[ajnaPosition.meta.quoteToken]}
                      quoteToken={ajnaPosition.meta.quoteToken}
                      steps={steps[ajnaPosition.meta.product][flow]}
                    >
                      {ajnaPosition.meta.product === 'borrow' && (
                        <AjnaProductContextProvider
                          form={useAjnaBorrowFormReducto({
                            action: flow === 'open' ? 'open' : 'deposit',
                          })}
                          position={ajnaPosition.position}
                          product={ajnaPosition.meta.product}
                        >
                          <AjnaBorrowView />
                        </AjnaProductContextProvider>
                      )}
                      {ajnaPosition.meta.product === 'earn' && (
                        <AjnaBorrowContextProvider position={ajnaPosition.position}>
                          <AjnaEarnView />
                        </AjnaBorrowContextProvider>
                      )}
                    </AjnaGeneralContextProvider>
                  ) : (
                    <>Earn UI placeholder</>
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
