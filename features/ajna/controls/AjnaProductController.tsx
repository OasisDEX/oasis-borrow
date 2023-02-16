import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { getAjnaBorrowHeadlineProps } from 'features/ajna/borrow/helpers'
import { AjnaBorrowView } from 'features/ajna/borrow/views/AjnaBorrowView'
import { steps } from 'features/ajna/common/consts'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaBorrowContextProvider } from 'features/ajna/contexts/AjnaProductContext'
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
                    <AjnaBorrowContextProvider
                      collateralBalance={collateralBalance}
                      ethBalance={ethBalance}
                      collateralToken={ajnaPosition.meta.collateralToken}
                      collateralPrice={tokenPriceUSD[ajnaPosition.meta.collateralToken]}
                      flow={flow}
                      currentPosition={ajnaPosition.position}
                      id={id}
                      product={ajnaPosition.meta.product}
                      quoteBalance={quoteBalance}
                      quoteToken={ajnaPosition.meta.quoteToken}
                      quotePrice={tokenPriceUSD[ajnaPosition.meta.quoteToken]}
                      ethPrice={tokenPriceUSD.ETH}
                      steps={steps[ajnaPosition.meta.product][flow]}
                      owner={ajnaPosition.meta.user}
                      {...(flow === 'manage' && { dpmProxy: ajnaPosition.meta.proxy })}
                    >
                      {ajnaPosition.meta.product === 'borrow' && <AjnaBorrowView />}
                    </AjnaBorrowContextProvider>
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
