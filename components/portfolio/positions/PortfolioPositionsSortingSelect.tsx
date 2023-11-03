import { type GenericSelectOption, GenericSelect } from 'components/GenericSelect'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { arrow_down, arrow_up_thin } from 'theme/icons'

import { PortfolioSortingType } from './types'

export const PortfolioPositionsSortingSelect = ({
  onChange,
}: {
  onChange: (value: GenericSelectOption) => void
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const sortingOptionsList: GenericSelectOption[] = [
    {
      label: tPortfolio('net-value'),
      value: PortfolioSortingType.netValueDescending,
      icon: arrow_down,
    },
    {
      label: tPortfolio('net-value'),
      value: PortfolioSortingType.netValueAscending,
      icon: arrow_up_thin,
    },
  ]
  return (
    <GenericSelect
      wrapperSx={{ minWidth: '148px' }}
      iconSize={16}
      iconPosition="right"
      placeholder="Sort by"
      options={sortingOptionsList}
      onChange={onChange}
    />
  )
}
