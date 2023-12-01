import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
} from 'features/omni-kit/components/details-section'
import { useAjnaCardDataBorrowRate } from 'features/omni-kit/protocols/ajna/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaContentFooterBorrowProps {
  changeVariant?: ChangeVariantType
  collateralToken: string
  cost: BigNumber
  isOracless: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaPosition
}

export function AjnaContentFooterBorrow({
  changeVariant,
  collateralToken,
  cost,
  isOracless,
  isOwner,
  isSimulationLoading,
  owner,
  position,
  quotePrice,
  quoteToken,
  simulation,
}: AjnaContentFooterBorrowProps) {
  const { t } = useTranslation()

  const availableToBorrow = position.debtAvailable()
  const afterAvailableToBorrow = simulation?.debtAvailable()

  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const borrowRateContentCardCommonData = useOmniCardDataBorrowRate({
    borrowRate: cost,
  })
  const borrowRateContentCardAjnaData = useAjnaCardDataBorrowRate({
    collateralToken,
    isOwner,
    owner,
    quoteToken,
    borrowRate: cost,
    ...(!isOracless && {
      quotePrice,
    }),
    debtAmount: position.debtAmount,
  })

  const formatted = {
    cost: formatDecimalAsPercent(cost),
    availableToBorrow: `${formatCryptoBalance(availableToBorrow)} ${quoteToken}`,
    afterAvailableToBorrow:
      afterAvailableToBorrow && `${formatCryptoBalance(afterAvailableToBorrow)} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(position.collateralAvailable)} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulation?.collateralAvailable &&
      `${formatCryptoBalance(simulation?.collateralAvailable)} ${collateralToken}`,
  }

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...borrowRateContentCardCommonData}
        {...borrowRateContentCardAjnaData}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.borrow.common.footer.available-to-withdraw')}
        value={formatted.availableToWithdraw}
        change={{
          isLoading: isSimulationLoading,
          value:
            simulation?.collateralAvailable &&
            `${formatted.afterAvailableToWithdraw} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
        modal={
          <DetailsSectionContentSimpleModal
            title={t('ajna.position-page.borrow.common.footer.available-to-withdraw')}
            description={t(
              'ajna.position-page.borrow.common.footer.available-to-withdraw-modal-desc',
            )}
            value={formatted.availableToWithdraw}
            theme={ajnaExtensionTheme}
          />
        }
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.borrow.common.footer.available-to-borrow')}
        value={formatted.availableToBorrow}
        change={{
          isLoading: isSimulationLoading,
          value:
            afterAvailableToBorrow &&
            `${formatted.afterAvailableToBorrow} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
        modal={
          <DetailsSectionContentSimpleModal
            title={t('ajna.position-page.borrow.common.footer.available-to-borrow')}
            description={t(
              'ajna.position-page.borrow.common.footer.available-to-borrow-modal-desc',
            )}
            value={formatted.availableToBorrow}
            theme={ajnaExtensionTheme}
          />
        }
      />
    </>
  )
}
