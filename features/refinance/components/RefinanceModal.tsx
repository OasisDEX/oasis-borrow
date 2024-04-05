import { Modal } from 'components/Modal'
import {
  RefinanceHeader,
  RefinancePosition,
  RefinanceSimulation,
} from 'features/refinance/components'
import { RefinanceFormController } from 'features/refinance/controllers'
import { initializeRefinanceContext } from 'features/refinance/helpers'
import type {
  RefinanceContextBase,
  RefinanceContextInput,
} from 'features/refinance/RefinanceContext'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { useModalContext } from 'helpers/modalHook'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Flex } from 'theme-ui'

interface RefinanceModalProps {
  contextInput: RefinanceContextInput
  id: string
}

export const RefinanceModal: FC<RefinanceModalProps> = ({ contextInput, id }) => {
  const { closeModal } = useModalContext()

  const { handleSetContext, handleOnClose, contexts, ...rest } = useRefinanceContext()

  const init = () => (defaultCtx?: RefinanceContextBase) =>
    initializeRefinanceContext({ contextInput, defaultCtx })

  useMemo(() => {
    handleSetContext(id, init)
  }, [])

  const onClose = () => {
    handleOnClose(id)
    closeModal()
  }

  return (
    <Modal sx={{ margin: '0 auto' }} close={onClose}>
      {rest && (
        <Flex sx={{ flexDirection: 'column', m: 3, height: ['auto', '800px'] }}>
          <RefinanceHeader onClose={onClose} />
          <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
            <RefinancePosition />
            <RefinanceFormController />
            <RefinanceSimulation />
          </Flex>
        </Flex>
      )}
    </Modal>
  )
}
