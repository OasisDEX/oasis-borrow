import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import {
  AfterPillProps,
  getAfterPillColors,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { Banner, bannerGradientPresets } from '../../../../../components/Banner'
import { VaultDetailsCardNetValue } from '../../../../../components/vault/detailsCards/VaultDetailsCardNetValue'
import { formatAmount, formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../pipes/openGuniVault'

function GuniOpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  totalCollateral,
  relevant,
}: OpenGuniVaultState & AfterPillProps & { relevant: boolean }) {
  const { t } = useTranslation()

  return (
    <VaultDetailsSummaryContainer relevant={relevant}>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(zero, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterOutstandingDebt, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />

      <VaultDetailsSummaryItem
        label={t('system.total-collateral', { token })}
        value={
          <>
            {formatCryptoBalance(zero)} {token}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatCryptoBalance(totalCollateral || zero)} {token}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.multiple')}
        value={
          <>
            {(0.0).toFixed(2)}x {t('system.exposure')}
          </>
        }
        valueAfter={showAfterPill && <>{multiply?.toFixed(2)}x</>}
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function GuniOpenMultiplyVaultDetails(props: OpenGuniVaultState) {
  const { t } = useTranslation()
  const {
    token,
    afterNetValueUSD,
    inputAmountsEmpty,
    stage,
    netValueUSD,
    currentPnL,
    totalGasSpentUSD,
    priceInfo,
    afterOutstandingDebt,
    totalCollateral,
    multiply,
  } = props
  console.log('props:', props)
  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountChangedSinceFirstRender = useHasChangedSinceFirstRender(inputAmountsEmpty)
  const oraclePrice = priceInfo.currentCollateralPrice
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const newComponentsEnabled = useFeatureToggle('NewComponents')
  console.log('newComponentsEnabled:', newComponentsEnabled)
  const { iconCircle, name } = getToken(token)
  return (
    <>
      <DetailsSection
        content={
          <>
            {/* Create component for Earn Header */}
            <Flex
              sx={{
                flexDirection: ['column', null, null, 'row'],
                alignItems: ['flex-start', null, null, 'flex-end'],
                mb: 4,
              }}
            >
              <Icon name={iconCircle} size="64px" sx={{ verticalAlign: 'text-bottom', mr: 3 }} />
              <Box>
                <Heading
                  as="h3"
                  variant="heading3"
                  sx={{
                    fontWeight: 'semiBold',
                    fontSize: '28px',
                    color: 'primary',
                  }}
                >
                  {`${(props.depositAmount || new BigNumber(0))?.toFixed(2)} DAI`}
                </Heading>
                <Text
                  variant="paragraph3"
                  color="text.subtitle"
                  sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}
                >
                  {`In this position`}
                </Text>
              </Box>
            </Flex>
            <DetailsSectionContentCardWrapper>
              <ContentCardNetValue
                token={token}
                oraclePrice={oraclePrice}
                afterNetValueUSD={afterNetValueUSD}
                changeVariant={changeVariant}
              />
            </DetailsSectionContentCardWrapper>
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsMultiply
              token={token}
              debt={zero}
              lockedCollateral={zero}
              multiply={zero}
              afterDebt={afterOutstandingDebt}
              afterLockedCollateral={totalCollateral}
              afterMultiply={multiply}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <Box sx={{ mt: '21px' }} />
      <Banner
        title={t('vault-banners.what-are-the-risks.header')}
        description={t('vault-banners.what-are-the-risks.content')}
        button={{ text: t('vault-banners.what-are-the-risks.button'), action: () => null }}
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
      />
    </>
  )
}
