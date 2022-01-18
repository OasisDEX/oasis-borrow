import { Icon } from '@makerdao/dai-ui-icons'
import React, { useState } from 'react'
import ReactSelect, {
  components,
  OptionProps,
  SingleValueProps,
  StylesConfig,
  ValueType,
} from 'react-select'
import { Flex } from 'theme-ui'

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

export interface ProductCardsSelectValue {
  value: string
  label: string
  icon: string
}

function OptionWithIcon(props: OptionProps<ProductCardsSelectValue>) {
  return (
    <Option {...props}>
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Icon name={`${props.data.icon}_color`} size="32px" sx={{ mr: 2, ml: 2 }} />
        {props.data.label}
      </Flex>
    </Option>
  )
}

const InputWithIcon = (props: SingleValueProps<ProductCardsSelectValue>) => {
  const { value } = props.selectProps
  return (
    <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
      <Icon
        name={`${(value as ProductCardsSelectValue).icon}_color`}
        size="32px"
        sx={{ mr: 2, ml: 2 }}
      />
      {(value as ProductCardsSelectValue).label}
    </Flex>
  )
}

interface ProductCardsSelectProps {
  options: { name: string; icon: string }[]
  handleChange: (tab: string) => void
}

export function ProductCardsSelect({ options, handleChange }: ProductCardsSelectProps) {
  const defaultValue = { label: options[0].name, value: options[0].name, icon: options[0].icon }
  const [option, setOption] = useState(defaultValue)

  function handleSelectChange(option: ValueType<ProductCardsSelectValue>) {
    setOption(option as ProductCardsSelectValue)
    handleChange((option as ProductCardsSelectValue).value)
  }

  return (
    <ReactSelect<ProductCardsSelectValue>
      options={options.map((tab) => ({ value: tab.name, label: tab.name, icon: tab.icon }))}
      onChange={handleSelectChange}
      styles={customStyles}
      value={option}
      components={{ Option: OptionWithIcon, SingleValue: InputWithIcon }}
    />
  )
}
