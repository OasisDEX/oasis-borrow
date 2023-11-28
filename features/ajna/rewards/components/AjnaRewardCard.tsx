import { Skeleton } from 'components/Skeleton'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ajnaBrandGradient, getGradientColor } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Image, Text } from 'theme-ui'

interface AjnaRewardCardProps {
  disabled?: boolean
  isLoading: boolean
  rewards: AjnaRewards
}

export function AjnaRewardCard({
  disabled,
  isLoading,
  rewards: { balance, balanceUsd, claimable },
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
      <Flex
        sx={{
          flexDirection: 'column',
          rowGap: '24px',
          mt: '24px',
          px: '24px',
          py: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 'mediumLarge',
        }}
      >
        <Text as="p" variant="paragraph2">
          <Trans
            i18nKey="ajna.rewards.claim"
            values={{ amount: formatCryptoBalance(claimable) }}
            components={{ strong: <strong /> }}
          />
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
      </Flex>
    </Box>
  )
}
