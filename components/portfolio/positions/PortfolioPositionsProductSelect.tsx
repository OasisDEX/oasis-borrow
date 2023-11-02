import { type GenericSelectOption, GenericSelect } from 'components/GenericSelect'
import { useTranslation } from 'react-i18next'

import { PortfolioProductType } from './types'

export const PortfolioPositionsProductSelect = ({
  onChange,
}: {
  onChange: (value: GenericSelectOption) => void
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const productOptionsList: GenericSelectOption[] = [
    {
      label: tPortfolio('all-products'),
      value: PortfolioProductType.allProducts,
    },
    {
      label: tPortfolio('borrow'),
      value: PortfolioProductType.borrow,
    },
    {
      label: tPortfolio('multiply'),
      value: PortfolioProductType.multiply,
    },
    {
      label: tPortfolio('earn'),
      value: PortfolioProductType.earn,
    },
    {
      label: tPortfolio('migrate'),
      value: PortfolioProductType.migrate,
    },
  ]
  return (
    <GenericSelect
      wrapperSx={{ minWidth: '148px', mr: 3 }}
      options={productOptionsList}
      onChange={onChange}
      defaultValue={productOptionsList[0]}
    />
  )
}
