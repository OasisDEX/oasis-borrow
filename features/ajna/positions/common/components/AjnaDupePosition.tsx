import { Modal, ModalCloseIcon } from 'components/Modal'
import { AjnaProduct } from 'features/ajna/common/types'
import { useModalContext } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Heading, Image, Text } from 'theme-ui'
import { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

interface AjnaDupePositionProps {
  collateralToken: string
  quoteToken: string
  product: AjnaProduct
  positions: CreatePositionEvent[]
}

export function AjnaDupePosition({
  collateralToken,
  positions,
  product,
  quoteToken,
}: AjnaDupePositionProps) {
  const { t } = useTranslation()
  const { closeModal } = useModalContext()

  const amount = positions.length > 1 ? 'plural' : 'singular'
  const type = product === 'earn' ? 'lender' : 'borrower'

  return (
    <Modal sx={{ maxWidth: '445px', mx: 'auto' }} close={closeModal}>
      <Box sx={{ px: 4, pt: 5, pb: '24px' }}>
        <ModalCloseIcon close={closeModal} />
        <Flex sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/safe.svg')} />
          <Heading variant="header5" sx={{ pt: 3, pb: 2 }}>
            {t('ajna.position-page.common.dupe-modal.title', {
              collateralToken,
              product: startCase(product),
              quoteToken,
            })}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ pb: 4, color: 'neutral80' }}>
            {t(`ajna.position-page.common.dupe-modal.description-${type}-${amount}`)}{' '}
            {t('ajna.position-page.common.dupe-modal.help')}
          </Text>
          <Button
            variant="primary"
            sx={{ width: '100%' }}
            onClick={closeModal}
          >
            {t('ajna.position-page.common.dupe-modal.cta')}
          </Button>
        </Flex>
      </Box>
    </Modal>
  )
}
