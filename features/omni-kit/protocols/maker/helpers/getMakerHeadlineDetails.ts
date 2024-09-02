import type BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { minutesUntilNextHour } from 'helpers/minutesUntilNextHour'
import { one } from 'helpers/zero'

export const getMakerHeadlineDetails = ({
  osmCurrentCollateralPrice,
  osmNextCollateralPrice,
}: {
  osmCurrentCollateralPrice: BigNumber
  osmNextCollateralPrice: BigNumber
}) => {
  const collateralPricePercentageChange = osmNextCollateralPrice
    .div(osmCurrentCollateralPrice)
    .minus(one)

  return [
    {
      label: 'Current Price',
      value: `$${formatFiatBalance(osmCurrentCollateralPrice)}`,
    },
    {
      label: 'Next Price',
      value: `$${formatFiatBalance(osmNextCollateralPrice)}`,
      sub: `in ${minutesUntilNextHour()} (${formatDecimalAsPercent(collateralPricePercentageChange)})`,
      subColor: getPriceChangeColor({
        collateralPricePercentageChange,
      }),
    },
  ]
}
