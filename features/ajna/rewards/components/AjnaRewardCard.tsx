import type { TxStatus } from '@oasisdex/transactions'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ajnaBrandGradient, getGradientColor } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
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

interface AjnaRewardCardBannerPropsAvailable {
  notAvailable?: never
  ownerPageLink: Link
  rewards: AjnaRewards
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
  rewards: AjnaRewards
}

export function AjnaRewardCard({
  isLoading,
  rewards: { balance, balanceUsd },
}: AjnaRewardCardProps) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        position: 'relative',
        width: '420px',
        mx: 'auto',
        p: '24px',
        textAlign: 'center',
        background: 'linear-gradient(90deg, #ffeffd 0%, #f5edff 100%), #fff',
        borderRadius: 'large',
      }}
    >
      <Image
        sx={{ display: 'block', mx: 'auto', mb: '12px' }}
        src={staticFilesRuntimeUrl('/static/img/ajna-logo-color.svg')}
      />
      <Text as="p" variant="boldParagraph3">
        {t('ajna.rewards.balance')}
      </Text>
      {isLoading ? (
        <>
          <Skeleton width="75%" height="38px" color="ajna" sx={{ mx: 'auto', my: 2 }} />
          <Skeleton width="50%" height="24px" color="ajna" sx={{ mx: 'auto' }} />
        </>
      ) : (
        <>
          <Text as="p" variant="header2" sx={getGradientColor(ajnaBrandGradient)}>
            {formatCryptoBalance(balance)}{' '}
            <Text as="small" variant="header3">
              $AJNA
            </Text>
          </Text>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            ${formatCryptoBalance(balanceUsd)}
          </Text>
        </>
      )}
      <Box
        sx={{
          mt: '24px',
          px: '24px',
          py: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 'mediumLarge',
        }}
      >
        asd
      </Box>
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
      {/* {isConnected && isLoading && <Skeleton sx={{ height: '220px', borderRadius: 'large' }} />} */}
    </Box>
  )
}
