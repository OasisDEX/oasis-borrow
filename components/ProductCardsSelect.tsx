import { Icon } from '@makerdao/dai-ui-icons'
import React, { useCallback, useMemo } from 'react'
import ReactSelect, {
  components,
  OptionProps,
  SingleValueProps,
  StylesConfig,
  ValueType,
} from 'react-select'
import { Flex } from 'theme-ui'

import { ProductLandingPagesFilter, ProductLandingPagesFiltersKeys } from '../helpers/productCards'
import { theme } from '../theme'

const customStyles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    height: '64px',
    borderRadius: '8px',
    outline: 'none',
    ':hover': { borderColor: theme.colors.primary, boxShadow: 'unset' },
  }),
  container: (styles) => ({ ...styles, maxWidth: '378px', flex: 1 }),
  singleValue: (styles) => ({ ...styles, fontWeight: theme.fontWeights.semiBold }),
  indicatorSeparator: () => ({ display: 'none' }),
  option: (styles, { isSelected }) => {
    return {
      ...styles,
      backgroundColor: isSelected ? theme.colors.selected : undefined,
      color: theme.colors.primary,
      ':hover': {
        backgroundColor: theme.colors.secondaryAlt,
      },
    }
  },
}

const { Option } = components

function OptionWithIcon(props: OptionProps<ProductLandingPagesFilter>) {
  return (
    <Option {...props}>
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Icon name={`${props.data.icon}_color`} size="32px" sx={{ mr: 2, ml: 2 }} />
        {props.data.name}
      </Flex>
    </Option>
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

  return (
    <ReactSelect<ProductLandingPagesFilter>
      options={options}
      onChange={handleSelectChange}
      styles={customStyles}
      value={value}
      components={{
        Option: OptionWithIcon,
        SingleValue: InputWithIcon,
      }}
      isOptionSelected={isSelected}
      isSearchable={false}
    />
  )
}
