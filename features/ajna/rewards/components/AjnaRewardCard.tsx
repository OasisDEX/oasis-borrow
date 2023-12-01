import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Skeleton } from 'components/Skeleton'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ajnaBrandGradient, getGradientColor } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useToggle } from 'helpers/useToggle'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Image, Text } from 'theme-ui'

interface AjnaRewardCardProps {
  disabled?: boolean
  isLoading: boolean
  rewards: AjnaRewards
}

interface AjnaRewardCardBreakdownItemProps {
  label: string
  value: string
}

export function AjnaRewardCardBreakdownItem({ label, value }: AjnaRewardCardBreakdownItemProps) {
  return (
    <>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold', color: 'neutral80', textAlign: 'left' }}>
        {label}
      </Text>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
        {value}
      </Text>
    </>
  )
}

export function AjnaRewardCard({
  disabled,
  isLoading,
  rewards: { bonus, claimable, regular, total, totalUsd },
}: AjnaRewardCardProps) {
  const { t } = useTranslation()

  const [isBreakdownOpen, toggleIsBreakdownOpen] = useToggle(false)

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
            {formatCryptoBalance(total)}{' '}
            <Text as="small" variant="header3">
              $AJNA
            </Text>
          </Text>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            ${formatCryptoBalance(totalUsd)}
          </Text>
        </>
      )}
      <Flex
        sx={{
          flexDirection: 'column',
          rowGap: '24px',
          mt: '24px',
          px: 3,
          pt: 4,
          pb: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 'mediumLarge',
        }}
      >
        <Text as="p" variant="paragraph2">
          {isLoading ? (
            <Skeleton height="24px" color="ajna" />
          ) : (
            <Trans
              i18nKey="ajna.rewards.claim"
              values={{ amount: formatCryptoBalance(claimable) }}
              components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
            />
          )}
        </Text>
        <Button
          // TODO: should also be disabled while rewards transaction is running
          disabled={disabled || claimable.isZero()}
          variant="primary"
          onClick={() => {
            // TODO: create rewards handler
          }}
        >
          {t('ajna.rewards.cta')}
        </Button>
        {!isLoading && total.gt(zero) && (
          <Box>
            <Button variant="unStyled" onClick={toggleIsBreakdownOpen}>
              <Text variant="paragraph3">{t('ajna.rewards.see-breakdown')}</Text>
              <ExpandableArrow
                direction={isBreakdownOpen ? 'up' : 'down'}
                sx={{ ml: 2, mb: '1px' }}
              />
            </Button>
            {isBreakdownOpen && (
              <Grid
                sx={{
                  gridTemplateColumns: 'auto auto',
                  justifyContent: 'space-between',
                  gap: 3,
                  mt: 3,
                }}
              >
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.bonus-rewards')}
                  value={`${formatCryptoBalance(bonus)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.regular-rewards')}
                  value={`${formatCryptoBalance(regular)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.total-rewards')}
                  value={`${formatCryptoBalance(total)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.claimable-today')}
                  value={`${formatCryptoBalance(claimable)} $AJNA`}
                />
              </Grid>
            )}
          </Box>
        )}
      </Flex>
    </Box>
  )
}
