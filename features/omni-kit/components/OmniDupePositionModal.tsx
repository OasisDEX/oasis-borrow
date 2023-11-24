import { NetworkIds } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { getOraclessProductUrl } from 'features/ajna/pool-finder/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useModalContext } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Box, Button, Flex, Heading, Image, Text, ThemeUIProvider } from 'theme-ui'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export interface OmniDupePositionModalProps {
  chainId?: NetworkIds
  collateralAddress: string
  collateralToken: string
  dpmAccounts: UserDpmAccount[]
  events: CreatePositionEvent[]
  productType: OmniProductType
  quoteAddress: string
  quoteToken: string
  walletAddress?: string
}

export function OmniDupePositionModal({
  chainId = NetworkIds.MAINNET,
  collateralAddress,
  collateralToken,
  dpmAccounts,
  events,
  productType,
  quoteAddress,
  quoteToken,
  walletAddress,
}: OmniDupePositionModalProps) {
  const { t } = useTranslation()
  const { closeModal } = useModalContext()

  const positionIds = events.map(
    (event) =>
      dpmAccounts.find(
        (dpmAccount) => dpmAccount.proxy.toLowerCase() === event.args.proxyAddress.toLowerCase(),
      )?.vaultId as string,
  )

  const hasMultiplyPositions = positionIds.length > 1
  const amount = hasMultiplyPositions ? 'plural' : 'singular'
  const type = productType === OmniProductType.Earn ? 'lender' : 'borrower'
  const primaryLink = hasMultiplyPositions
    ? `/owner/${walletAddress}`
    : `${getOraclessProductUrl({
        chainId,
        collateralAddress,
        collateralToken,
        productType,
        quoteAddress,
        quoteToken,
      })}/${positionIds[0]}`
  const primaryText = hasMultiplyPositions
    ? t('ajna.position-page.common.dupe-modal.cta-primary')
    : `${t('system.go-to-position')} #${positionIds[0]}`

  return (
    <ThemeUIProvider theme={ajnaExtensionTheme}>
      <Modal sx={{ maxWidth: '445px', mx: 'auto' }} close={closeModal}>
        <Box sx={{ px: 4, pt: 5, pb: '24px' }}>
          <ModalCloseIcon close={closeModal} />
          <Flex sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Image src={staticFilesRuntimeUrl('/static/img/safe.svg')} />
            <Heading variant="header5" sx={{ pt: 3, pb: 2 }}>
              {t('ajna.position-page.common.dupe-modal.title', {
                collateralToken,
                productType: startCase(productType),
                quoteToken,
              })}
            </Heading>
            <Text as="p" variant="paragraph3" sx={{ pb: 4, color: 'neutral80' }}>
              {t(`ajna.position-page.common.dupe-modal.description-${type}-${amount}`)}{' '}
              {t('ajna.position-page.common.dupe-modal.help')}
            </Text>
            <AppLink href={primaryLink} onClick={closeModal} sx={{ width: '100%' }}>
              <Button variant="primary" sx={{ width: '100%' }}>
                {primaryText}
              </Button>
            </AppLink>
            <Button variant="textual" onClick={closeModal} sx={{ mt: '24px', p: 0 }}>
              {t('ajna.position-page.common.dupe-modal.cta-textual')}
            </Button>
          </Flex>
        </Box>
      </Modal>
    </ThemeUIProvider>
  )
}
