import { Icon } from '@makerdao/dai-ui-icons'
import React, { useCallback, useMemo } from 'react'
import ReactSelect, { OptionProps, SingleValueProps, StylesConfig, ValueType } from 'react-select'
import { Box, Flex } from 'theme-ui'

import {
  ProductLandingPagesFilter,
  ProductLandingPagesFiltersKeys,
} from '../../helpers/productCards'
import { reactSelectCustomComponents } from '../reactSelectCustomComponents'

const customStyles: StylesConfig = {
  container: (styles) => ({ ...styles, maxWidth: '378px', flex: 1 }),
}

function OptionWithIcon({ innerProps, data, isSelected }: OptionProps<ProductLandingPagesFilter>) {
  return (
    <Box
      {...innerProps}
      sx={{
        py: 2,
        px: 3,
        bg: isSelected ? 'interactive10' : undefined,
        cursor: 'pointer',
        '&:hover': {
          bg: 'neutral30',
        },
      }}
    >
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Icon name={`${data.icon}_color`} size="32px" sx={{ mr: 2, ml: 2 }} />
        {data.name}
      </Flex>
    </Box>
  )
}

const InputWithIcon = (props: SingleValueProps<ProductLandingPagesFilter>) => {
  const { value } = props.selectProps
  return (
    <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
      <Icon
        name={`${(value as ProductLandingPagesFilter).icon}_color`}
        size="32px"
        sx={{ mr: 2, ml: 2 }}
      />
      {(value as ProductLandingPagesFilter).name}
    </Flex>
  )
}

interface ProductCardsSelectProps {
  options: Array<ProductLandingPagesFilter>
  handleChange: (tab: ProductLandingPagesFiltersKeys) => void
  currentFilter: string
}

export function ProductCardsSelect({
  options,
  handleChange,
  currentFilter,
}: ProductCardsSelectProps) {
  const handleSelectChange = useCallback(
    (option: ValueType<ProductLandingPagesFilter>) =>
      handleChange((option as ProductLandingPagesFilter).name),
    [],
  )

  const value = useMemo(() => options.find((option) => option.name === currentFilter), [
    currentFilter,
  ])

  const isSelected = useMemo(
    () => (option: ProductLandingPagesFilter) => currentFilter === option.name,
    [currentFilter],
  )

  const productCardSelectComponents = useMemo(
    () => reactSelectCustomComponents<ProductLandingPagesFilter>(),
    [],
  )

  return (
    <ReactSelect<ProductLandingPagesFilter>
      options={options}
      onChange={handleSelectChange}
      styles={customStyles}
      value={value}
      components={{
        ...productCardSelectComponents,
        Option: OptionWithIcon,
        SingleValue: InputWithIcon,
      }}
      isOptionSelected={isSelected}
      isSearchable={false}
    />
  )
}
