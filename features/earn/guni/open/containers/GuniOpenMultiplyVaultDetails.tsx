import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { GasPriceParams } from 'blockchain/prices'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentFooterItemsEarnSimulate } from 'components/vault/detailsSection/ContentFooterItemsEarnSimulate'
import {
  calculateBreakeven,
  calculateEarnings,
  Yield,
  YieldPeriod,
} from 'helpers/earn/calculations'
import { OAZO_LOWER_FEE } from 'helpers/multiply/calculations'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

import { Banner, bannerGradientPresets } from '../../../../../components/Banner'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../pipes/openGuniVault'
import { GuniVaultDetailsTitle } from './GuniVaultDetailsTitle'

const examplePosition = {
  usdcSwapAmount: new BigNumber(3_750_000),
  gasUsed: new BigNumber(1_400_000),
  depositAmount: new BigNumber(150_000),
}

export enum EarnSimulateViewMode {
  Simulate = 'simulate',
  FAQ = 'position-info',
}

function calculateEntryFees(
  gasPrice: BigNumber,
  DAIUsd: BigNumber,
  ETHUsd: BigNumber,
  daiAmountToSwapForUsdc: BigNumber = examplePosition.usdcSwapAmount,
  actualGasCostInDai?: BigNumber,
) {
  const oazoFee = daiAmountToSwapForUsdc.times(OAZO_LOWER_FEE)

  if (actualGasCostInDai) {
    return actualGasCostInDai.plus(oazoFee)
  }

  return oazoFee.plus(
    examplePosition.gasUsed.times(amountFromWei(gasPrice).times(ETHUsd).div(DAIUsd)),
  )
}

export function GuniOpenMultiplyVaultDetails(
  props: OpenGuniVaultState & GasPriceParams & { ETH: BigNumber; DAI: BigNumber } & Yield,
) {
  const setHash = useHash()[1]
  const { t } = useTranslation()
  const { token, yields } = props

  let breakeven = zero
  const apy7 = yields[YieldPeriod.Yield7Days]?.value || zero
  const apy30 = yields[YieldPeriod.Yield30Days]?.value || zero
  const apy90 = yields[YieldPeriod.Yield90Days]?.value || zero

  const depositAmount = props.depositAmount?.gt(zero)
    ? props.depositAmount
    : examplePosition.depositAmount

  const entryFees = calculateEntryFees(
    props.maxFeePerGas,
    props.DAI,
    props.ETH,
    props.depositAmount?.gt(zero) ? props.buyingCollateralUSD : undefined,
    props.gasEstimationDai,
  )

  if (depositAmount.gt(zero) && apy7.gt(zero)) {
    breakeven = calculateBreakeven({
      depositAmount,
      entryFees: entryFees,
      apy: apy7,
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
      t('earn-vault.simulate.rowlabel1'),
      `${formatCryptoBalance(earnings30.earningsAfterFees)} DAI`,
      `${formatCryptoBalance(earnings30.netValue)} DAI`,
    ],
    [
      t('earn-vault.simulate.rowlabel2'),
      `${formatCryptoBalance(earnings90.earningsAfterFees)} DAI`,
      `${formatCryptoBalance(earnings90.netValue)} DAI`,
    ],
    [
      t('earn-vault.simulate.rowlabel3'),
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
              headers={[
                t('earn-vault.simulate.header1'),
                t('earn-vault.simulate.header2'),
                t('earn-vault.simulate.header3'),
              ]}
              rows={contentRowData}
              footnote={
                <>
                  {t('earn-vault.simulate.footnote1')}
                  <br />
                  {t('earn-vault.simulate.footnote2')}
                </>
              }
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarnSimulate
              token={`DAI`}
              breakeven={breakeven}
              entryFees={entryFees}
              apy={apy7.times(100)}
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
          action: () => setHash(EarnSimulateViewMode.FAQ),
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
