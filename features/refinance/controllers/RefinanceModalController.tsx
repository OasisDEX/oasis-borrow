import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
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
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useEffect, useMemo } from 'react'
import { useBeforeUnload } from 'react-use'
import { from, of } from 'rxjs'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Text } from 'theme-ui'

interface RefinanceModalProps {
  contextInput: RefinanceContextInput
}

export const RefinanceModalController: FC<RefinanceModalProps> = ({ contextInput }) => {
  const { closeModal } = useModalContext()
  const { t } = useTranslation()

  const { productHub: data } = usePreloadAppDataContext()

  const interestRatesInput = getRefinanceInterestRatesInputParams(data.table)

  const { handleOnClose, ctx, cache } = useRefinanceGeneralContext()

  const isTxInProgress = !!ctx?.tx.isTxInProgress

  useBeforeUnload(isTxInProgress)

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
  const [positionOwnerData] = useObservable(positionOwner)
  const [interestRatesData] = useObservable(interestRates)

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
  const simulation = useSdkSimulation({ owner: positionOwnerData })

  useEffect(() => {
    if (positionOwnerData) cache.handlePositionOwner(positionOwnerData)
  }, [positionOwnerData])

  useEffect(() => {
    if (interestRatesData) cache.handleInterestRates(interestRatesData)
  }, [interestRatesData])

  return (
    <Modal sx={{ margin: '0 auto' }} close={onClose}>
      <WithLoadingIndicator
        value={[ctx, positionOwnerData, interestRatesData]}
        customLoader={<RefinanceModalSkeleton onClose={onClose} />}
      >
        {([_ctx, _owner, _interestRates]) => (
          <RefinanceContextProvider
            ctx={{
              ..._ctx,
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
    </Modal>
  )
}

function RefinanceModalContainer({ onClose }: Readonly<{ onClose: () => void }>) {
  const { t } = useTranslation()
  const isMobile = useOnMobile()

  return (
    <Flex sx={{ flexDirection: 'column', m: 3, height: ['auto', '800px'] }}>
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
