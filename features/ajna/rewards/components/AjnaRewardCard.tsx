import type { TxStatus } from '@oasisdex/transactions'
import type { BigNumber } from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Button, Card, Flex, Heading, Image, Spinner, Text } from 'theme-ui'

interface Link {
  title: string
  href: string
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
  isLoading: boolean
  rewards: {
    tokens: BigNumber
    usd: BigNumber
  }
}

export function AjnaRewardCard({ isLoading }: AjnaRewardCardProps) {
  const { isConnected, walletAddress } = useAccount()

  return (
    <Box
      sx={{
        position: 'relative',
        width: '420px',
        mx: 'auto',
        p: '24px',
        background: 'linear-gradient(90deg, #ffeffd 0%, #f5edff 100%), #fff',
        borderRadius: 'large',
      }}
    >
      <Image
        sx={{ display: 'block', mx: 'auto', mb: '12px' }}
        src={staticFilesRuntimeUrl('/static/img/ajna-logo-color.svg')}
      />
      {/* {walletAddress && !isLoading && (
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
      )} */}
      {isConnected && isLoading && <Skeleton sx={{ height: '220px', borderRadius: 'large' }} />}
    </Box>
  )
}
