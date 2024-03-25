import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { Icon } from 'components/Icon'
import { ModalCloseIcon } from 'components/Modal'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { TokensGroup } from 'components/TokensGroup'
import { formatAddress } from 'helpers/formatters/format'
import { useModalContext } from 'helpers/modalHook'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { arrow_right } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Text } from 'theme-ui'

interface HeaderRightSectionProps {
  walletAddress?: string
}

const HeaderRightSection: FC<HeaderRightSectionProps> = ({ walletAddress }) => {
  return (
    <Flex sx={{ mr: 4, alignItems: 'center' }}>
      {walletAddress && (
        <Text
          as="p"
          variant="paragraph3"
          sx={{
            ml: 3,
            color: 'primary100',
            fontWeight: 'semiBold',
            letterSpacing: '0.02em',
            fontSize: 1,
            backgroundColor: 'neutral30',
            px: 3,
            py: 2,
            borderRadius: 'round',
          }}
        >
          {formatAddress(walletAddress, 6)}
        </Text>
      )}
    </Flex>
  )
}

export const RefinanceHeader = () => {
  const { t } = useTranslation()
  const isMobile = useOnMobile()

  // use context to get these
  const { primaryToken, secondaryToken, positionId, fromProtocol, toProtocol, walletAddress } = {
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    positionId: new BigNumber(18604), // as optional
    fromProtocol: {
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
    },
    toProtocol: {
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.SparkV3,
    }, // toProtocol as optional
    walletAddress: '0xbEf4befb4F230F43905313077e3824d7386E09F8',
  }

  const { closeModal } = useModalContext()

  return (
    <Flex sx={{ justifyContent: 'space-between', mb: '24px' }}>
      <Flex sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: [3, 0] }}>
        <TokensGroup tokens={[primaryToken, secondaryToken]} />
        <Text as="h2" sx={{ fontSize: 4, fontWeight: 'semiBold', ml: 2 }}>
          {t('refinance.modal-title', { pair: `${primaryToken}/${secondaryToken}` })}
          {positionId && (
            <Text as="span" sx={{ fontSize: 2, fontWeight: 'semiBold', ml: 2, color: 'neutral80' }}>
              #{positionId.toString()}
            </Text>
          )}
        </Text>
        <Flex sx={{ ml: [0, 2], alignItems: 'center' }}>
          <ProtocolLabel network={fromProtocol.network} protocol={fromProtocol.protocol} />
          {toProtocol && (
            <>
              <Icon icon={arrow_right} size="16px" sx={{ mx: 2 }} />
              <ProtocolLabel network={toProtocol.network} protocol={toProtocol.protocol} />
            </>
          )}
          {isMobile && <HeaderRightSection walletAddress={walletAddress} />}
        </Flex>
      </Flex>
      {!isMobile && <HeaderRightSection walletAddress={walletAddress} />}
      <ModalCloseIcon close={closeModal} sx={{ top: '20px' }} />
    </Flex>
  )
}
