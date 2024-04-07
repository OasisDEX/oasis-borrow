import { Modal } from 'components/Modal'
import {
  RefinanceHeader,
  RefinancePosition,
  RefinanceSimulation,
} from 'features/refinance/components'
import { RefinanceContextProvider } from 'features/refinance/contexts'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { useRefinanceGeneralContext } from 'features/refinance/contexts/RefinanceGeneralContext'
import { RefinanceFormController } from 'features/refinance/controllers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useModalContext } from 'helpers/modalHook'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Flex } from 'theme-ui'

interface RefinanceModalProps {
  contextInput: RefinanceContextInput
}

export const RefinanceModal: FC<RefinanceModalProps> = ({ contextInput }) => {
  const { closeModal } = useModalContext()

  const { handleSetContext, handleOnClose, ctx } = useRefinanceGeneralContext()

  useMemo(() => {
    handleSetContext(contextInput)
  }, [])

  const onClose = () => {
    handleOnClose(contextInput.contextId)
    closeModal()
  }

  return (
    <Modal sx={{ margin: '0 auto' }} close={onClose}>
      <WithLoadingIndicator value={[ctx]} customLoader={<>'LOADING'</>}>
        {([_ctx]) => (
          <RefinanceContextProvider ctx={_ctx}>
            <Flex sx={{ flexDirection: 'column', m: 3, height: ['auto', '800px'] }}>
              <RefinanceHeader onClose={onClose} />
              <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
                <RefinancePosition />
                <RefinanceFormController />
                <RefinanceSimulation />
              </Flex>
            </Flex>
          </RefinanceContextProvider>
        )}
      </WithLoadingIndicator>
    </Modal>
  )
}
