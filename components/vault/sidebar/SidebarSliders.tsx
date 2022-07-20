import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { VaultErrors } from 'components/vault/VaultErrors'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { extractGenerateErrors } from 'helpers/messageMappers'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent } from 'react'
import { Box, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

type VaultState = OpenMultiplyVaultState | ManageMultiplyVaultState

interface SidebarSliderAdjustMultiplyProps {
  collapsed?: boolean
  disabled?: boolean
  max?: BigNumber
  min: BigNumber
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  state: VaultState
  value: BigNumber
}

export function SidebarSliderAdjustMultiply({
  collapsed = false,
  disabled = false,
  max,
  min,
  onChange,
  state,
  value,
}: SidebarSliderAdjustMultiplyProps) {
  const { t } = useTranslation()

  const { afterLiquidationPrice, afterCollateralizationRatio, multiply } = state

  const {
    theme: { colors },
  } = useThemeUI()

  const slider = value ? max?.minus(value).div(max.minus(min)).times(100) : zero

  const currentCollaterizationRatio = 'vault' in state ? state.vault.collateralizationRatio : zero

  const collRatioColor = getCollRatioColor(state, afterCollateralizationRatio)
  const sliderBackground =
    multiply && !multiply.isNaN() && slider
      ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
          colors?.sliderTrackFill
        } ${slider.toNumber()}%, ${colors?.neutral60} ${slider.toNumber()}%, ${
          colors?.neutral60
        } 100%)`
      : 'neutral60'

  return (
    <Grid
      gap={2}
      sx={
        collapsed
          ? {
              px: 3,
              py: 2,
              border: 'lightMuted',
              borderTop: 'none',
              borderBottomLeftRadius: 'mediumLarge',
              borderBottomRightRadius: 'mediumLarge',
            }
          : {}
      }
    >
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          fontWeight: 'semiBold',
          color: 'neutral80',
        }}
      >
        <Grid as="p" gap={2}>
          <Text as="span">{t('system.liquidation-price')}</Text>
          <Text as="span" variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
            ${formatAmount(afterLiquidationPrice, 'USD')}
          </Text>
        </Grid>
        <Grid as="p" gap={2}>
          <Text as="span" sx={{ textAlign: 'right' }}>
            {t('system.collateral-ratio')}
          </Text>
          <Text
            as="span"
            variant="paragraph1"
            sx={{ fontWeight: 'semiBold', textAlign: 'right', color: collRatioColor }}
          >
            {!currentCollaterizationRatio.isEqualTo(afterCollateralizationRatio) && (
              <>
                <Text
                  as="span"
                  variant="paragraph1"
                  sx={{ fontWeight: 'semiBold', color: 'primary100' }}
                >
                  {formatPercent(currentCollaterizationRatio.times(100))}
                  <Icon name="arrow_right" size="16px" sx={{ ml: 2, mr: 2 }} />
                </Text>
              </>
            )}
            {formatPercent(afterCollateralizationRatio.times(100))}
          </Text>
        </Grid>
      </Flex>
      <Box my={1}>
        <Slider
          sx={{
            background: sliderBackground,
            direction: 'rtl',
          }}
          disabled={disabled}
          step={0.05}
          min={min.toNumber()}
          max={max?.toNumber()}
          value={value.toNumber()}
          onChange={onChange}
        />
      </Box>
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          color: 'neutral80',
        }}
      >
        <Text as="span">{t('slider.adjust-multiply.left-footer')}</Text>
        <Text as="span">{t('slider.adjust-multiply.right-footer')}</Text>
      </Flex>
      <VaultErrors
        errorMessages={extractGenerateErrors(state.errorMessages)}
        ilkData={state.ilkData}
        maxGenerateAmount={state.maxGenerateAmount}
      />
    </Grid>
  )
}
