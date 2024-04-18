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
import { getRefinancePositionOwner } from 'features/refinance/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useEffect, useMemo } from 'react'
import { EMPTY, from } from 'rxjs'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Text } from 'theme-ui'

interface RefinanceModalProps {
  contextInput: RefinanceContextInput
}

export const RefinanceModalController: FC<RefinanceModalProps> = ({ contextInput }) => {
  const { t } = useTranslation()
  const { closeModal } = useModalContext()
  const isMobile = useOnMobile()

  const { handleSetContext, handleOnClose, ctx, cache } = useRefinanceGeneralContext()

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
        : EMPTY,
    [contextInput.contextId, cache.positionOwner],
  )
  const [owner] = useObservable(positionOwner)

  useMemo(() => {
    handleSetContext(contextInput)
  }, [])

  const onClose = () => {
    handleOnClose(contextInput.contextId)
    closeModal()
  }

  useEffect(() => {
    if (owner) cache.handlePositionOwner(owner)
  }, [owner])

  const resolvedOwner = cache.positionOwner || owner

  return (
    <Modal sx={{ margin: '0 auto' }} close={onClose}>
      <WithLoadingIndicator
        value={[ctx, resolvedOwner]}
        customLoader={<RefinanceModalSkeleton onClose={onClose} />}
      >
        {([_ctx, _owner]) => (
          <RefinanceContextProvider
            ctx={{
              ..._ctx,
              position: {
                ..._ctx.position,
                owner: _owner,
              },
            }}
          >
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
          </RefinanceContextProvider>
        )}
      </WithLoadingIndicator>
    </Modal>
  )
}
