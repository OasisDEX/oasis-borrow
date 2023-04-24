import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers/getAjnaWithArrowColorScheme'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { FC, ReactNode } from 'react'
import { Box, Button, Card, Flex, Heading, Image, Spinner, Text } from 'theme-ui'

interface Link {
  title: string
  href: string
}

interface AjnaRewardCardListBoxProps {
  title: string
  list: string[]
  link: Link
}

const AjnaRewardCardListBox: FC<AjnaRewardCardListBoxProps> = ({ title, list, link }) => {
  const { t } = useTranslation()

  return (
    <>
      <Heading
        sx={{
          mb: [0, 3],
          fontSize: [3, 5],
          fontWeight: 'regular',
          color: ['neutral80', 'primary100'],
        }}
      >
        {t(title)}
      </Heading>
      <Box
        as="ul"
        sx={{
          display: ['none', 'flex'],
          flexDirection: 'column',
          rowGap: 1,
          p: 0,
          mb: 3,
          listStylePosition: 'inside',
        }}
      >
        {list.map((item) => (
          <Text
            key={item}
            as="li"
            variant="paragraph3"
            sx={{
              alignItems: 'flex-start',
              display: 'list-item',
              color: 'neutral80',
              wordWrap: 'break-word',
            }}
          >
            {t(item)}
          </Text>
        ))}
      </Box>
      <AppLink href={link.href} sx={{ display: ['none', 'block'] }}>
        <WithArrow gap={1} sx={{ ...getAjnaWithArrowColorScheme() }}>
          {t(link.title)}
        </WithArrow>
      </AppLink>
    </>
  )
}

interface EarningOnPositionsLinkProps {
  ownerPageLink: Link
  numberOfPositions: number
  walletAddress: string
  mobileOnly?: boolean
}

const EarningOnPositionsLink: FC<EarningOnPositionsLinkProps> = ({
  ownerPageLink,
  numberOfPositions,
  walletAddress,
  mobileOnly,
}) => {
  return (
    <Box
      sx={{
        display: mobileOnly ? ['block', 'none'] : ['none', 'block'],
        mt: [0, 3],
        fontSize: [1, 2],
        color: 'neutral80',
        transform: 'translateX(-8px)',
      }}
    >
      <Trans
        i18nKey={ownerPageLink.title}
        values={{ value: numberOfPositions || 0 }}
        components={{
          1: (
            <AppLink
              href={`${ownerPageLink.href}/${walletAddress}`}
              sx={{
                mt: [0, 3],
              }}
              key="card-link"
            />
          ),
          2: <WithArrow as="span" gap={1} sx={{ color: 'inherit', fontWeight: 'regular' }} />,
        }}
      />
    </Box>
  )
}

interface BannerProps {
  title: string
  button: { title: string }
  footer?: string
}

interface Rewards {
  tokens: BigNumber
  usd: BigNumber
  numberOfPositions: number
}

interface AjnaRewardCardBannerProps {
  banner: BannerProps
  rewards: Rewards
  gradient: string
  ownerPageLink: Link
  walletAddress: string
  onBtnClick?: () => void
  txStatus?: TxStatus
}

const AjnaRewardCardBanner: FC<AjnaRewardCardBannerProps> = ({
  banner,
  rewards,
  gradient,
  ownerPageLink,
  walletAddress,
  onBtnClick,
  txStatus,
}) => {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        width: '100%',
        mt: [0, 4],
        p: 4,
        pb: 4,
        pt: [0, 4],
        border: 'none',
        borderRadius: 'large',
        background: ['none', gradient],
      }}
    >
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Heading variant="boldParagraph3" sx={{ display: ['none', 'block'] }}>
          {t(banner.title)}
        </Heading>
        <Text as="p" sx={{ color: 'primary100', fontSize: '36px', fontWeight: 'regular' }}>
          {formatCryptoBalance(rewards.tokens)}
          <Text as="span" sx={{ fontSize: '28px', pl: 2 }}>
            AJNA
          </Text>
        </Text>
        <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
          ${formatFiatBalance(rewards.usd)}
        </Text>
        {rewards.tokens.gt(zero) && (
          <Button
            sx={{ mb: [0, banner.footer ? 3 : 0], mt: [4, 4], fontSize: 1, p: 0 }}
            disabled={txStatus && progressStatuses.includes(txStatus)}
            onClick={onBtnClick}
          >
            <Flex
              sx={{
                p: 2,
              }}
            >
              {txStatus && progressStatuses.includes(txStatus) ? (
                <Flex sx={{ px: 3, alignItems: 'center', gap: 2 }}>
                  <Text
                    as="span"
                    variant="paragraph3"
                    sx={{ color: 'inherit', fontSize: 'inherit' }}
                  >
                    {t('system.in-progress')}
                  </Text>
                  <Spinner
                    variant="styles.spinner.medium"
                    size={14}
                    sx={{
                      color: 'white',
                      boxSizing: 'content-box',
                    }}
                  />
                </Flex>
              ) : (
                <WithArrow
                  gap={1}
                  sx={{
                    color: 'inherit',
                    fontSize: 'inherit',
                    pl: 3,
                    pr: '24px',
                    alignItems: 'center',
                  }}
                >
                  {txStatus && failedStatuses.includes(txStatus)
                    ? t('retry')
                    : t(banner.button.title)}
                </WithArrow>
              )}
            </Flex>
          </Button>
        )}
        <EarningOnPositionsLink
          ownerPageLink={ownerPageLink}
          numberOfPositions={rewards.numberOfPositions}
          walletAddress={walletAddress}
        />
      </Flex>
    </Card>
  )
}

interface AjnaRewardCardProps {
  title: string
  image: string
  list: string[]
  link: Link
  ownerPageLink: Link
  banner: BannerProps
  gradient: string
  isLoading: boolean
  rewards: Rewards
  onBtnClick?: () => void
  txStatus?: TxStatus
  notAvailable?: boolean
  floatingLabel?: ReactNode
}

export function AjnaRewardCard({
  title,
  image,
  list,
  link,
  ownerPageLink,
  banner,
  gradient,
  onBtnClick,
  txStatus,
  isLoading,
  rewards,
  notAvailable,
  floatingLabel,
}: AjnaRewardCardProps) {
  const { isConnected, walletAddress } = useAccount()

  return (
    <Card p={4} sx={{ height: '100%', borderRadius: 'large', position: 'relative' }}>
      {floatingLabel}
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Flex
          sx={{
            width: '100px',
            height: '100px',
            justifyContent: 'center',
            alignItems: 'center',
            mb: [3, 4],
            borderRadius: 'ellipse',
            background: gradient,
          }}
        >
          <Image src={staticFilesRuntimeUrl(image)} />
        </Flex>
        <AjnaRewardCardListBox title={title} list={list} link={link} />
        {walletAddress && !isLoading && !notAvailable && (
          <AjnaRewardCardBanner
            rewards={rewards}
            banner={banner}
            gradient={gradient}
            onBtnClick={onBtnClick}
            txStatus={txStatus}
            ownerPageLink={ownerPageLink}
            walletAddress={walletAddress}
          />
        )}
        {isConnected && isLoading && !notAvailable && <Skeleton sx={{ mt: 4, height: '202px' }} />}
        {rewards && walletAddress && (
          <EarningOnPositionsLink
            ownerPageLink={ownerPageLink}
            numberOfPositions={rewards.numberOfPositions}
            walletAddress={walletAddress}
            mobileOnly
          />
        )}
      </Flex>
    </Card>
  )
}
