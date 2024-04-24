import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { Modal } from 'components/Modal'
import {
  RefinanceHeader,
  RefinanceModalSkeleton,
  RefinancePosition,
  RefinanceSimulation,
} from 'features/refinance/components'
import { RefinanceContextProvider } from 'features/refinance/contexts'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { useRefinanceGeneralContext } from 'features/refinance/contexts/RefinanceGeneralContext'
import { RefinanceFormController } from 'features/refinance/controllers/index'
import {
  getRefinanceAaveLikeInterestRates,
  getRefinanceInterestRatesInputParams,
  getRefinancePositionOwner,
} from 'features/refinance/helpers'
import { useSdkSimulation } from 'features/refinance/hooks/useSdkSimulation'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useEffect, useMemo } from 'react'
import { useBeforeUnload } from 'react-use'
import { EMPTY, from, of } from 'rxjs'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Text } from 'theme-ui'

interface RefinanceModalProps {
  contextInput: RefinanceContextInput
}

export const RefinanceModalController: FC<RefinanceModalProps> = ({ contextInput }) => {
  const { closeModal } = useModalContext()
  const { t } = useTranslation()

  const { productHub: data } = usePreloadAppDataContext()
  const { tokenPriceUSD$ } = useProductContext()
  const interestRatesInput = getRefinanceInterestRatesInputParams(data.table)

  const { handleOnClose, ctx, cache } = useRefinanceGeneralContext()

  const isTxInProgress = !!ctx?.tx.isTxInProgress

  useBeforeUnload(isTxInProgress)

  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        ctx
          ? tokenPriceUSD$([
              ctx.position.collateralTokenData.token.symbol,
              ctx.position.debtTokenData.token.symbol,
              'ETH',
            ])
          : EMPTY,
      [ctx?.position.collateralTokenData.token.symbol, ctx?.position.debtTokenData.token.symbol],
    ),
  )

  const positionOwner = useMemo(
    () =>
      !cache.positionOwner
        ? from(
            getRefinancePositionOwner({
              protocol: contextInput.position.lendingProtocol,
              positionId: contextInput.position.positionId.id,
              chainId: contextInput.environment.chainId,
            }),
          )
        : of(cache.positionOwner),
    [
      cache.positionOwner,
      contextInput.environment.chainId,
      contextInput.position.lendingProtocol,
      contextInput.position.positionId.id,
    ],
  )

  // If needed we should extend it with other network & protocols and map to the same interface
  const interestRates = useMemo(
    () =>
      !cache.interestRatesMetadata
        ? from(getRefinanceAaveLikeInterestRates(interestRatesInput))
        : of(cache.interestRatesMetadata),
    [cache.interestRatesMetadata],
  )
  const [positionOwnerData, positionOwnerError] = useObservable(positionOwner)
  const [interestRatesData, interestRatesError] = useObservable(interestRates)

  const onClose = () => {
    if (isTxInProgress) {
      if (window.confirm(t('refinance.close-prompt'))) {
        handleOnClose(contextInput.contextId)
        closeModal()
      }
      return
    }

    handleOnClose(contextInput.contextId)
    closeModal()
  }
  const simulation = useSdkSimulation({ tickers: tokenPriceUSDData })

  useEffect(() => {
    if (positionOwnerData) cache.handlePositionOwner(positionOwnerData)
  }, [positionOwnerData])

  useEffect(() => {
    if (interestRatesData) cache.handleInterestRates(interestRatesData)
  }, [interestRatesData])

  return (
    <Modal sx={{ margin: '0 auto' }} close={onClose} variant="modalAutoWidth">
      <WithErrorHandler error={[positionOwnerError, interestRatesError, tokenPriceUSDError]}>
        <WithLoadingIndicator
          value={[ctx, positionOwnerData, interestRatesData, tokenPriceUSDData]}
          customLoader={<RefinanceModalSkeleton onClose={onClose} />}
        >
          {([_ctx, _owner, _interestRates, _tokenPriceUSD]) => (
            <RefinanceContextProvider
              ctx={{
                ..._ctx,
                environment: {
                  ..._ctx.environment,
                  marketPrices: {
                    collateralPrice:
                      _tokenPriceUSD[_ctx.position.collateralTokenData.token.symbol].toString(),
                    debtPrice: _tokenPriceUSD[_ctx.position.debtTokenData.token.symbol].toString(),
                    ethPrice: _tokenPriceUSD['ETH'].toString(),
                  },
                },
                metadata: {
                  ..._ctx.metadata,
                  interestRates: _interestRates,
                },
                position: {
                  ..._ctx.position,
                  owner: _owner,
                },
                simulation,
              }}
            >
              <RefinanceModalContainer onClose={onClose} />
            </RefinanceContextProvider>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Modal>
  )
}

function RefinanceModalContainer({ onClose }: Readonly<{ onClose: () => void }>) {
  const { t } = useTranslation()
  const isMobile = useOnMobile()

  return (
    <Flex sx={{ flexDirection: 'column', m: 3, minHeight: ['auto', '800px'] }}>
      <RefinanceHeader onClose={onClose} />
      {isMobile ? (
        <Text variant="paragraph2">{t('refinance.mobile-not-available')}</Text>
      ) : (
        <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
          <RefinancePosition />
          <RefinanceFormController />
          <RefinanceSimulation />
        </Flex>
      )}
    </Flex>
  )
}
