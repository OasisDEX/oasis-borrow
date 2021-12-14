import { getToken } from 'blockchain/tokensMetadata'
import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount } from 'helpers/formatters/format'
import { pick } from 'helpers/pick'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function OpenVaultDetailsSummary() {
  const {
    generateAmount,
    afterFreeCollateral,
    token,
    maxGenerateAmountCurrentPrice,
    inputAmountsEmpty,
    liquidationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
    afterCollateralizationRatio,
    stage,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx,
      'generateAmount',
      'afterFreeCollateral',
      'token',
      'maxGenerateAmountCurrentPrice',
      'inputAmountsEmpty',
      'afterCollateralizationRatio',
      'stage',
    ),
    ...pick(
      ctx.ilkData,
      'liquidationRatio',
      'collateralizationDangerThreshold',
      'collateralizationWarningThreshold',
    ),
    afterDepositAmountUSD: ctx.depositAmountUSD,
  }))

  const { symbol } = getToken(token)
  const { t } = useTranslation()

  const afterCollRatioColor = getCollRatioColor(
    inputAmountsEmpty,
    liquidationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
    afterCollateralizationRatio,
  )
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountWasChanged = useHasChangedSinceFirstRender(inputAmountsEmpty)

  return (
    <VaultDetailsSummaryContainer relevant={inputAmountWasChanged}>
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
              {formatAmount(generateAmount || zero, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(zero, symbol)}
            {` ${symbol}`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterFreeCollateral.isNegative() ? zero : afterFreeCollateral, symbol)}
              {` ${symbol}`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(zero, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(maxGenerateAmountCurrentPrice.minus(generateAmount || zero), 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}
