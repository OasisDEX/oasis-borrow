import { GenericSelect, type GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { PortfolioSortingType } from 'components/portfolio/positions/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { arrow_down, arrow_up_thin, portfolio_sort_dropdown_icon } from 'theme/icons'
import { Box, Text } from 'theme-ui'

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
      wrapperSx={{ minWidth: '150px' }}
      iconSize={10}
      placeholder={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon icon={portfolio_sort_dropdown_icon} size={32} sx={{ mr: 2 }} />
          <Text>Sort by</Text>
        </Box>
      }
      options={sortingOptionsList}
      onChange={onChange}
    />
  )
}
