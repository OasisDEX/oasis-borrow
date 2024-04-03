import { Modal } from 'components/Modal'
import {
  RefinanceHeader,
  RefinancePosition,
  RefinanceSimulation,
} from 'features/refinance/components'
import { RefinanceFormController } from 'features/refinance/controllers'
import { useModalContext } from 'helpers/modalHook'
import React from 'react'
import { Flex } from 'theme-ui'

export const RefinanceModal = () => {
  const { closeModal } = useModalContext()

  return (
    <Modal sx={{ margin: '0 auto' }} close={closeModal}>
      <Flex sx={{ flexDirection: 'column', m: 3, height: ['auto', '800px'] }}>
        <RefinanceHeader />
        <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
          <RefinancePosition />
          <RefinanceFormController />
          <RefinanceSimulation />
        </Flex>
      </Flex>
    </Modal>
  )
}
