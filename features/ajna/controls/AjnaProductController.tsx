import { views } from '@oasisdex/oasis-actions'
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
import { useEffect, useMemo, useState } from 'react'
import { EMPTY } from 'rxjs'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/src/helpers/ajna'

interface AjnaProductControllerOpenFlow {
  collateralToken: string
  product: AjnaProduct
  quoteToken?: string
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
  const { balancesInfoArray$, context$, dpmPositionData$, tokenPriceUSD$ } = useAppContext()
  const { walletAddress } = useAccount()

  const [positionData, setPositionData] = useState<AjnaPosition>()
  const [productData, setProductData] = useState<AjnaProduct | undefined>(product)
  const [collateralTokenData, setCollateralTokenData] = useState<string | undefined>(
    collateralToken,
  )
  const [quoteTokenData, setQuoteTokenData] = useState<string | undefined>(quoteToken)

  const [context] = useObservable(context$)
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        collateralTokenData && quoteTokenData
          ? balancesInfoArray$([collateralTokenData, quoteTokenData], walletAddress || '')
          : EMPTY,
      [collateralTokenData, walletAddress],
    ),
  )
  const [dpmPositionArgsData] = useObservable(
    useMemo(() => (id ? dpmPositionData$(getPositionIdentity(id)) : EMPTY), [id]),
  )
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        collateralTokenData && quoteTokenData
          ? tokenPriceUSD$([collateralTokenData, quoteTokenData, 'ETH'])
          : EMPTY,
      [collateralTokenData, quoteTokenData],
    ),
  )

  useEffect(() => {
    if (
      dpmPositionArgsData === null ||
      (dpmPositionArgsData && dpmPositionArgsData.protocol !== 'Ajna')
    )
      void push('/404')
    else if (context && dpmPositionArgsData) {
      setProductData(dpmPositionArgsData.product.toLowerCase() as AjnaProduct)
      setCollateralTokenData(dpmPositionArgsData.collateralToken)
      setQuoteTokenData(dpmPositionArgsData.quoteToken)

      void views.ajna
        .getPosition(
          {
            proxyAddress: dpmPositionArgsData.proxy,
            poolAddress:
              context.ajnaPoolPairs[
                `${dpmPositionArgsData.collateralToken}-${dpmPositionArgsData.quoteToken}` as keyof typeof context.ajnaPoolPairs
              ].address,
          },
          {
            poolInfoAddress: context.ajnaPoolInfo.address,
            provider: context.rpcProvider,
          },
        )
        .then((position) => {
          setPositionData(position)
        })
    }
  }, [dpmPositionArgsData])

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler error={[balancesInfoArrayError, tokenPriceUSDError]}>
              <WithLoadingIndicator
                value={[
                  productData,
                  collateralTokenData,
                  quoteTokenData,
                  balancesInfoArrayData,
                  tokenPriceUSDData,
                  ...(id ? [positionData] : []),
                ]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaBorrowHeadlineProps({
                      collateralToken: collateralTokenData,
                      flow,
                      product: productData,
                      quoteToken: quoteTokenData,
                      id,
                    })}
                  />
                }
              >
                {([
                  _product,
                  _collateralToken,
                  _quoteToken,
                  [collateralBalance, quoteBalance],
                  _tokenPriceUSD,
                ]) => (
                  <AjnaBorrowContextProvider
                    collateralBalance={collateralBalance}
                    collateralToken={_collateralToken}
                    collateralPrice={_tokenPriceUSD[_collateralToken]}
                    flow={flow}
                    position={{ id }}
                    product={_product}
                    quoteBalance={quoteBalance}
                    quoteToken={_quoteToken}
                    quotePrice={_tokenPriceUSD[_quoteToken]}
                    ethPrice={_tokenPriceUSD.ETH}
                    steps={steps[_product][flow]}
                  >
                    {_product === 'borrow' && <AjnaBorrowView />}
                  </AjnaBorrowContextProvider>
                )}
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AjnaWrapper>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
