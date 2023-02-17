import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { AjnaBorrowContextProvider } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { getAjnaBorrowHeadlineProps } from 'features/ajna/borrow/helpers'
import { AjnaBorrowView } from 'features/ajna/borrow/views/AjnaBorrowView'
import { steps } from 'features/ajna/common/consts'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductContextProvider } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaEarnContextProvider } from 'features/ajna/earn/contexts/AjnaEarnContext'
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
                    {...getAjnaBorrowHeadlineProps({
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
                    <AjnaProductContextProvider
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
                        <AjnaBorrowContextProvider position={ajnaPosition.position}>
                          <AjnaBorrowView />
                        </AjnaBorrowContextProvider>
                      )}
                      {ajnaPosition.meta.product === 'earn' && (
                        // TODO: position won't match until we have them and their interfaces from lib
                        // @ts-ignore
                        <AjnaEarnContextProvider position={ajnaPosition.position}>
                          <AjnaEarnView />
                        </AjnaEarnContextProvider>
                      )}
                    </AjnaProductContextProvider>
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
