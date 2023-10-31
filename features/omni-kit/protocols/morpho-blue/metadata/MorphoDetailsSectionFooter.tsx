import type { MorphoPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { OmniProductType } from 'features/omni-kit/types'
import { displayMultiple } from 'helpers/display-multiple'
import { formatAmount, formatPrecision } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface MorphoDetailsSectionFooterProps {
  collateralToken: string
  position: MorphoPosition
  productType: OmniProductType
  quoteToken: string
  simulation?: MorphoPosition
}

export const MorphoDetailsSectionFooter: FC<MorphoDetailsSectionFooterProps> = ({
  position,
  simulation,
  collateralToken,
  productType,
  quoteToken,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.position-debt')}
        value={`${formatPrecision(position.debtAmount, 4)} ${quoteToken}`}
        change={
          simulation && {
            variant: simulation.debtAmount.gt(position.debtAmount) ? 'positive' : 'negative',
            value: `${formatPrecision(
              simulation.debtAmount.lt(zero) ? zero : simulation.debtAmount,
              4,
            )} ${quoteToken} ${t('after')}`,
          }
        }
      />
      <DetailsSectionFooterItem
        title={t('system.total-exposure', { token: collateralToken })}
        value={`${formatAmount(position.collateralAmount, collateralToken)} ${collateralToken}`}
        change={
          simulation && {
            variant: simulation.collateralAmount.gt(position.collateralAmount)
              ? 'positive'
              : 'negative',
            value: `${formatAmount(
              simulation.collateralAmount,
              collateralToken,
            )} ${collateralToken} ${t('after')}`,
          }
        }
      />
      {productType === OmniProductType.Multiply && (
        <>
          <DetailsSectionFooterItem
            sx={{ pr: 3 }}
            title={t('system.multiple')}
            value={displayMultiple(position.riskRatio.multiple)}
            change={
              simulation && {
                variant: simulation.riskRatio.multiple.gt(position.riskRatio.multiple)
                  ? 'positive'
                  : 'negative',
                value: `${simulation.riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t(
                  'after',
                )}`,
              }
            }
          />
          <DetailsSectionFooterItem
            sx={{ pr: 3 }}
            title={t('system.buying-power')}
            value={`${formatPrecision(position.buyingPower, 2)} USD`}
            change={
              simulation && {
                variant: simulation.buyingPower.gt(position.buyingPower) ? 'positive' : 'negative',
                value: `${formatPrecision(simulation.buyingPower, 2)} USD ${t('after')}`,
              }
            }
          />
        </>
      )}
    </>
  )
}
