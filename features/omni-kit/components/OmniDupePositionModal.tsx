import { networksById } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useModalContext } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { type LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import type { Theme } from 'theme-ui'
import { Box, Button, Flex, Heading, Image, Link, Text, ThemeUIProvider } from 'theme-ui'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

export interface OmniDupePositionModalProps {
  collateralAddress: string
  collateralToken: string
  dpmAccounts: UserDpmAccount[]
  events: CreatePositionEvent[]
  isOracless: boolean
  networkId: OmniSupportedNetworkIds
  productType: OmniProductType
  protocol: LendingProtocol
  quoteAddress: string
  quoteToken: string
  theme?: Theme
  walletAddress?: string
}

export function OmniDupePositionModal({
  collateralAddress,
  collateralToken,
  dpmAccounts,
  events,
  isOracless,
  networkId,
  productType,
  protocol,
  quoteAddress,
  quoteToken,
  theme = {},
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
  const networkName = networksById[networkId].name
  const amount = hasMultiplyPositions ? 'plural' : 'singular'
  const type = productType === OmniProductType.Earn ? 'lender' : 'borrower'
  const primaryLink = hasMultiplyPositions
    ? `/owner/${walletAddress}`
    : `${getOmniPositionUrl({
        protocol,
        isPoolOracless: isOracless,
        collateralAddress,
        collateralToken,
        networkName,
        productType,
        quoteAddress,
        quoteToken,
      })}/${positionIds[0]}`
  const primaryText = hasMultiplyPositions
    ? t('omni-kit.dupe-modal.cta-primary')
    : `${t('system.go-to-position')} #${positionIds[0]}`

  return (
    <ThemeUIProvider theme={theme}>
      <Modal sx={{ maxWidth: '445px', mx: 'auto' }} close={closeModal}>
        <Box sx={{ px: 4, pt: 5, pb: '24px' }}>
          <ModalCloseIcon close={closeModal} />
          <Flex sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Image src={staticFilesRuntimeUrl('/static/img/safe.svg')} />
            <Heading variant="header5" sx={{ pt: 3, pb: 2 }}>
              {t('omni-kit.dupe-modal.title', {
                collateralToken,
                productType: startCase(productType),
                protocol: LendingProtocolLabel[protocol],
                quoteToken,
              })}
            </Heading>
            <Text as="p" variant="paragraph3" sx={{ pb: 4, color: 'neutral80' }}>
              {t(`omni-kit.dupe-modal.description-${type}-${amount}`)}{' '}
              {t('omni-kit.dupe-modal.help')}
            </Text>
            <Link href={primaryLink} onClick={closeModal} sx={{ width: '100%' }}>
              <Button variant="primary" sx={{ width: '100%' }}>
                {primaryText}
              </Button>
            </Link>
            <Button variant="textual" onClick={closeModal} sx={{ mt: '24px', p: 0 }}>
              {t('omni-kit.dupe-modal.cta-textual')}
            </Button>
          </Flex>
        </Box>
      </Modal>
    </ThemeUIProvider>
  )
}
