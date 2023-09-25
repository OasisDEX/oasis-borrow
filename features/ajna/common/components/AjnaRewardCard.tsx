import type { TxStatus } from '@oasisdex/transactions'
import type { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers/getAjnaWithArrowColorScheme'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC, ReactNode } from 'react'
import React from 'react'
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
    <Box sx={{ mb: [2, 4] }}>
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
      <AppLink href={link.href} sx={{ display: ['none', 'block'], textAlign: 'center' }}>
        <WithArrow gap={1} sx={{ ...getAjnaWithArrowColorScheme() }}>
          {t(link.title)}
        </WithArrow>
      </AppLink>
    </Box>
  )
}

interface BannerProps {
  title: string
  button: { title: string }
  footer?: string
}

export interface Rewards {
  tokens: BigNumber
  usd: BigNumber
}

interface AjnaRewardCardBannerPropsAvailable {
  notAvailable?: never
  ownerPageLink: Link
  rewards: Rewards
  txStatus?: TxStatus
  walletAddress: string
  onBtnClick?: () => void
}

interface AjnaRewardCardBannerPropsUnavailable {
  notAvailable: true
  ownerPageLink?: never
  rewards?: never
  txStatus?: never
  walletAddress?: never
  onBtnClick?: never
}

type AjnaRewardCardBannerProps = (
  | AjnaRewardCardBannerPropsAvailable
  | AjnaRewardCardBannerPropsUnavailable
) & {
  banner: BannerProps
  claimingDisabled: boolean
  gradient: string
}

const AjnaRewardCardBanner: FC<AjnaRewardCardBannerProps> = ({
  banner,
  claimingDisabled,
  gradient,
  notAvailable,
  onBtnClick,
  rewards,
  txStatus,
}) => {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        width: '100%',
        minHeight: '220px',
        mt: 'auto',
        px: 4,
        py: [0, 4],
        border: 'none',
        borderRadius: 'large',
        background: ['none', gradient],
      }}
    >
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Heading variant="boldParagraph3" sx={{ display: ['none', 'block'] }}>
          {t(banner.title)}
        </Heading>
        <Text as="p" sx={{ color: 'primary100', fontSize: '36px', fontWeight: 'semiBold' }}>
          {notAvailable ? (
            <Text as="span" sx={{ fontSize: '28px', pl: 2 }}>
              {t('coming-soon')}
            </Text>
          ) : (
            <>
              {formatCryptoBalance(rewards.tokens)}
              <Text as="span" sx={{ fontSize: '28px', pl: 2 }}>
                AJNA
              </Text>
            </>
          )}
        </Text>
        {/* TODO uncomment once ajna token usdc price will be available*/}
        {/*<Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>*/}
        {/*  ${(rewards.usd)}*/}
        {/*</Text>*/}
        {!notAvailable && (
          <>
            {rewards.tokens.gt(zero) && (
              <Button
                sx={{ mb: [0, banner.footer ? 3 : 0], mt: [4, 4], fontSize: 1, py: 0 }}
                disabled={claimingDisabled || (txStatus && progressStatuses.includes(txStatus))}
                onClick={onBtnClick}
              >
                <Flex
                  sx={{
                    p: 2,
                  }}
                >
                  {claimingDisabled ? (
                    t('ajna.rewards.cards.button-disabled')
                  ) : (
                    <>
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
                    </>
                  )}
                </Flex>
              </Button>
            )}
          </>
        )}
      </Flex>
    </Card>
  )
}

interface AjnaRewardCardProps {
  banner: BannerProps
  claimingDisabled?: boolean
  floatingLabel?: ReactNode
  gradient: string
  image: string
  isLoading: boolean
  link: Link
  list: string[]
  notAvailable?: boolean
  onBtnClick?: () => void
  ownerPageLink: Link
  rewards: Rewards
  title: string
  txStatus?: TxStatus
}

export function AjnaRewardCard({
  banner,
  floatingLabel,
  gradient,
  image,
  isLoading,
  link,
  list,
  notAvailable,
  onBtnClick,
  ownerPageLink,
  rewards,
  title,
  txStatus,
}: AjnaRewardCardProps) {
  const { isConnected, walletAddress } = useAccount()

  return (
    <Card p={4} sx={{ height: '100%', borderRadius: 'large', position: 'relative' }}>
      {floatingLabel}
      <Flex sx={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
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
        {notAvailable ? (
          <AjnaRewardCardBanner banner={banner} gradient={gradient} notAvailable claimingDisabled />
        ) : (
          <>
            {walletAddress && !isLoading && (
              <AjnaRewardCardBanner
                banner={banner}
                claimingDisabled
                gradient={gradient}
                onBtnClick={onBtnClick}
                ownerPageLink={ownerPageLink}
                rewards={rewards}
                txStatus={txStatus}
                walletAddress={walletAddress}
              />
            )}
            {isConnected && isLoading && (
              <Skeleton sx={{ height: '220px', borderRadius: 'large' }} />
            )}
          </>
        )}
      </Flex>
    </Card>
  )
}
