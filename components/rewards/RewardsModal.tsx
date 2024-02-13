import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { InfoSection } from 'components/infoSection/InfoSection'
import { RewardsModalBanner } from 'components/rewards'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { chevron_down, chevron_up, sparks } from 'theme/icons'
import { Button, Card, Flex, Link, Text } from 'theme-ui'

interface RewardsModalProps {
  gradient: [string, string]
  unit: string
  tokenIcon: IconProps['icon']
  rewards: {
    totalClaimableAndTotalCurrentPeriodEarned: BigNumber
    totalClaimableAndTotalCurrentPeriodEarnedUsd: BigNumber
    claimable: BigNumber
    currentPeriodTotalEarned: BigNumber
    currentPeriodPositionEarned: BigNumber
    totalEarnedToDate: BigNumber
  }
  link: string
  claimClick?: () => void
  btnAsLink?: boolean
  linkKey?: string
}

export const RewardsModal: FC<RewardsModalProps> = ({
  unit,
  gradient,
  tokenIcon,
  rewards: {
    totalClaimableAndTotalCurrentPeriodEarned,
    totalClaimableAndTotalCurrentPeriodEarnedUsd,
    claimable,
    currentPeriodTotalEarned,
    currentPeriodPositionEarned,
    totalEarnedToDate,
  },
  link,
  btnAsLink,
  claimClick,
  linkKey = 'omni-kit.content-card.rewards.modal-link',
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const backgroundImage = useMemo(() => {
    return `linear-gradient(90deg, ${gradient
      .map((color, i) => `${color} ${(i / (gradient.length - 1)) * 100}%`)
      .join(', ')})`
  }, [gradient])

  const formatted = {
    totalClaimableAndTotalCurrentPeriodEarned: formatCryptoBalance(
      totalClaimableAndTotalCurrentPeriodEarned,
    ),
    totalClaimableAndTotalCurrentPeriodEarnedUsd: `$${formatFiatBalance(
      totalClaimableAndTotalCurrentPeriodEarnedUsd,
    )}`,
    claimable: `${formatCryptoBalance(claimable)} ${unit}`,
    currentPeriodTotalEarned: `${formatCryptoBalance(currentPeriodTotalEarned)} ${unit}`,
    currentPeriodPositionEarned: `${formatCryptoBalance(currentPeriodPositionEarned)} ${unit}`,
    totalEarnedToDate: `${formatCryptoBalance(totalEarnedToDate)} ${unit}`,
  }

  return (
    <DetailsSectionContentSimpleModal
      title={
        <Flex sx={{ alignItems: 'center' }}>
          <Icon size={20} icon={sparks} sx={{ mr: 1, mb: 1 }} />
          {t('omni-kit.content-card.rewards.title')}
        </Flex>
      }
    >
      <RewardsModalBanner
        value={formatted.totalClaimableAndTotalCurrentPeriodEarned}
        subValue={formatted.totalClaimableAndTotalCurrentPeriodEarnedUsd}
        unit={unit}
        icon={tokenIcon}
      />
      <Card variant="rewardsDetails">
        <Flex
          sx={{
            fontWeight: 'bold',
            mb: expanded ? 3 : 0,
            cursor: 'pointer',
            justifyContent: 'space-between',
          }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <Flex sx={{ alignItems: 'center' }}>
            {t('omni-kit.content-card.rewards.modal-value-1')}
            <Icon size={20} icon={tokenIcon} sx={{ mx: 1 }} />
            <Text
              as="span"
              className="withGradient"
              sx={{
                backgroundImage,
                WebkitBackgroundClip: 'text',
                backgroundSize: '100% 100%',
                backgroundPosition: '0 0',
                backgroundRepeat: 'no-repeat',
                backgroundColor: gradient[0],
                textFillColor: 'transparent',
                mr: 1,
              }}
            >
              {formatted.claimable}
            </Text>
            {t('omni-kit.content-card.rewards.modal-value-2')}
          </Flex>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon size={12} icon={expanded ? chevron_up : chevron_down} sx={{ mx: 1 }} />
          </Flex>
        </Flex>
        {expanded && (
          <InfoSection
            withListPadding={false}
            items={[
              {
                label: t('omni-kit.content-card.rewards.modal-value-3'),
                value: formatted.currentPeriodTotalEarned,
              },
              {
                label: t('omni-kit.content-card.rewards.modal-value-4'),
                value: formatted.currentPeriodPositionEarned,
              },
              {
                label: t('omni-kit.content-card.rewards.modal-value-5'),
                value: formatted.totalEarnedToDate,
              },
            ]}
          />
        )}
      </Card>
      <Button
        variant="primary"
        sx={{ cursor: 'pointer' }}
        onClick={() => claimClick && claimClick()}
      >
        {btnAsLink ? (
          <Link
            href={link}
            sx={{ textAlign: 'center', fontSize: 'inherit', color: 'inherit' }}
            target="_blank"
          >
            {t('claim')}
          </Link>
        ) : (
          t('claim')
        )}
      </Button>
      <Link href={link} sx={{ textAlign: 'center' }} target="_blank">
        {t(linkKey)}
      </Link>
    </DetailsSectionContentSimpleModal>
  )
}
