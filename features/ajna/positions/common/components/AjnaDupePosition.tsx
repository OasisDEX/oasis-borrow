import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { AjnaProduct } from 'features/ajna/common/types'
import { useModalContext } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Box, Button, Flex, Grid, Heading, Image, Text, ThemeProvider } from 'theme-ui'

interface AjnaDupePositionProps {
  collateralToken: string
  quoteToken: string
  product: AjnaProduct
  positionIds: string[]
}

export function AjnaDupePosition({
  collateralToken,
  positionIds,
  product,
  quoteToken,
}: AjnaDupePositionProps) {
  const { t } = useTranslation()
  const { closeModal } = useModalContext()

  const amount = positionIds.length > 1 ? 'plural' : 'singular'
  const type = product === 'earn' ? 'lender' : 'borrower'

  return (
    <ThemeProvider theme={ajnaExtensionTheme}>
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
            <Button variant="primary" sx={{ width: '100%' }} onClick={closeModal}>
              {t('ajna.position-page.common.dupe-modal.cta')}
            </Button>
            <Grid as="ul" sx={{ rowGap: 1, m: 0, pt: '24px', pl: 0, listStyle: 'none' }}>
              {positionIds.map((positionId) => (
                <Box as="li">
                  <AppLink
                    href={`/ethereum/ajna/borrow/${collateralToken}-${quoteToken}/${positionId}`}
                    onClick={closeModal}
                  >
                    {t('system.go-to-position')} #{positionId}
                  </AppLink>
                </Box>
              ))}
            </Grid>
          </Flex>
        </Box>
      </Modal>
    </ThemeProvider>
  )
}
