import { GenericMultiselect } from 'components/GenericMultiselect'
import { type GenericSelectOption } from 'components/GenericSelect'
import { PortfolioProductType } from 'components/portfolio/positions/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { portfolio_product_dropdown_icon } from 'theme/icons'
import { Box } from 'theme-ui'

export const PortfolioPositionsProductSelect = ({
  onChange,
}: {
  onChange: (value: string[]) => void
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const productOptionsList: GenericSelectOption[] = [
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
    <Box sx={{ mr: 3 }}>
      <GenericMultiselect
        icon={portfolio_product_dropdown_icon}
        label="products"
        options={productOptionsList}
        onChange={onChange}
      />
    </Box>
  )
}
