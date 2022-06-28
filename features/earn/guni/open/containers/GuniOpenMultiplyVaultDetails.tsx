import { Icon } from '@makerdao/dai-ui-icons'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { GasPriceParams } from 'blockchain/prices'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentFooterItemsEarn } from 'components/vault/detailsSection/ContentFooterItemsEarn'
import { calculateBreakeven, calculateEarnings } from 'features/earn/earnCalculations'
import { OAZO_LOWER_FEE } from 'helpers/multiply/calculations'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

import { Banner, bannerGradientPresets } from '../../../../../components/Banner'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../pipes/openGuniVault'

const usdcSwapAmountOnExamplePosition = new BigNumber(`2018064.22`)

function calculateEntryFees(
  gasPrice: BigNumber,
  DAIUsd: BigNumber,
  ETHUsd: BigNumber,
  daiAmountToSwapForUsdc: BigNumber = usdcSwapAmountOnExamplePosition,
  actualGasCostInDai?: BigNumber,
) {
  const oazoFee = daiAmountToSwapForUsdc.times(OAZO_LOWER_FEE)

  if (actualGasCostInDai) {
    const daiGasFee = actualGasCostInDai
    return daiGasFee.plus(oazoFee)
  }

  const estimatedGasUsed = new BigNumber(1000000)
  return oazoFee.plus(estimatedGasUsed.times(amountFromWei(gasPrice).times(ETHUsd).div(DAIUsd)))
}

interface GuniVaultDetailsTitleProps {
  token: string
  depositAmount: BigNumber
}

function GuniVaultDetailsTitle({ token, depositAmount }: GuniVaultDetailsTitleProps) {
  const { iconCircle } = getToken(token)

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        px: [3, null, '24px'],
        py: '24px',
        borderBottom: 'lightMuted',
      }}
    >
      <Icon
        name={iconCircle}
        size="64px"
        sx={{
          verticalAlign: 'text-bottom',
          mr: 3,
        }}
      />
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
          {`${formatCryptoBalance(depositAmount)} DAI`}
        </Heading>
        <Text
          variant="paragraph3"
          color="text.subtitle"
          sx={{
            fontWeight: 'semiBold',
          }}
        >
          {`In this position`}
        </Text>
      </Box>
    </Flex>
  )
}

const examplePositionDepositAmount = new BigNumber(150000)

export function GuniOpenMultiplyVaultDetails(
  props: OpenGuniVaultState & GasPriceParams & { ETH: BigNumber; DAI: BigNumber },
) {
  const { t } = useTranslation()
  const { token, yields } = props

  let breakeven = zero
  const apy30 = yields[1]?.value || zero
  const apy90 = yields[2]?.value || zero

  const depositAmount = props.depositAmount?.gt(zero)
    ? props.depositAmount
    : examplePositionDepositAmount

  const entryFees = calculateEntryFees(
    props.maxFeePerGas,
    props.DAI,
    props.ETH,
    props.depositAmount?.gt(zero) ? props.buyingCollateralUSD : undefined,
    props.gasEstimationDai,
  )

  if (entryFees.gt(zero) && depositAmount.gt(zero) && apy30.gt(zero)) {
    breakeven = calculateBreakeven({
      depositAmount,
      entryFees: entryFees,
      apy: apy30,
    })
  }

  const earnings30 = calculateEarnings({
    depositAmount,
    apy: apy30,
    days: new BigNumber(30),
  })
  const earnings90 = calculateEarnings({
    depositAmount,
    apy: apy90,
    days: new BigNumber(90),
  })
  // Note: We're using the 90 day yield for annual earnings calculations
  const earnings1yr = calculateEarnings({
    depositAmount,
    apy: apy90,
    days: new BigNumber(365),
  })

  const contentRowData: [string, string, string][] = [
    [
      'Previous 30 days*',
      `${formatCryptoBalance(earnings30.earningsAfterFees)} DAI`,
      `${formatCryptoBalance(earnings30.netValue)} DAI`,
    ],
    [
      'Previous 90 days*',
      `${formatCryptoBalance(earnings90.earningsAfterFees)} DAI`,
      `${formatCryptoBalance(earnings90.netValue)} DAI`,
    ],
    [
      'Previous 1 year**',
      `${formatCryptoBalance(earnings1yr.earningsAfterFees)} DAI`,
      `${formatCryptoBalance(earnings1yr.netValue)} DAI`,
    ],
  ]

  return (
    <>
      <DetailsSection
        title={<GuniVaultDetailsTitle token={token} depositAmount={depositAmount} />}
        content={
          <>
            <DetailsSectionContentTable
              headers={['Duration', 'Earnings after fees', 'Net value']}
              rows={contentRowData}
              footnote={
                <>
                  *Past performance is not indicative of future results.
                  <br />
                  **Prior year estimates use the 90 day APY.
                </>
              }
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarn
              token={`DAI`}
              breakeven={breakeven}
              entryFees={entryFees}
              apy={apy30.times(100)}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <Box sx={{ mt: '21px' }} />
      <Banner
        title={t('vault-banners.what-are-the-risks.header')}
        description={t('vault-banners.what-are-the-risks.content')}
        button={{
          text: t('vault-banners.what-are-the-risks.button'),
          action: () => null,
        }}
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
      />
    </>
  )
}
