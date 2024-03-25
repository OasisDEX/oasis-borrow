import { Modal } from 'components/Modal'
import { RefinanceHeader } from 'features/refinance/components/RefinanceHeader'
import { useModalContext } from 'helpers/modalHook'
import React from 'react'
import { Flex } from 'theme-ui'

export const RefinanceModal = () => {
  const { closeModal } = useModalContext()

  const content = <>Dummy content</>

  return (
    <Modal
      sx={{ maxWidth: ['auto', '1200px'], maxHeight: ['auto', '800px'], margin: '0 auto' }}
      close={closeModal}
    >
      <Flex sx={{ flexDirection: 'column', m: 3 }}>
        <RefinanceHeader />
        {content}
      </Flex>
    </Modal>
  )
}
