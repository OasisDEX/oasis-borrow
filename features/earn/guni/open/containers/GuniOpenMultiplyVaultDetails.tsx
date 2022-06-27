import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardTable,
  DetailsSectionContentCardWrapper,
  DetailsSectionContentTable,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsEarn } from 'components/vault/detailsSection/ContentFooterItemsEarn'
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
  const { iconCircle } = getToken(token)
  return (
    <>
      <DetailsSection
        title={
          <Flex
            sx={{
              flexDirection: ['column', null, 'row'],
              px: [3, null, '24px'],
              py: '24px',
              borderBottom: 'lightMuted',
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
              <Text variant="paragraph3" color="text.subtitle" sx={{ fontWeight: 'semiBold' }}>
                {`In this position`}
              </Text>
            </Box>
          </Flex>
        }
        content={
          <>
            <DetailsSectionContentTable
              headers={['Duration', 'Earnings after fees', 'Net value']}
              rows={[['Previous', '34,000.20 DAI', '34,000.20 DAI']]}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarn
              token={token}
              earn={zero}
              afterEarn={multiply}
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
