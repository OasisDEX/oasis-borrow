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

export interface TokenSelectValue {
  value: string
  label: string
  icon: string
}

function OptionWithIcon(props: OptionProps<TokenSelectValue>) {
  return (
    <Option {...props}>
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Icon name={`${props.data.icon}_color`} size="32px" sx={{ mr: 2, ml: 2 }} />
        {props.data.label}
      </Flex>
    </Option>
  )
}

const InputWithIcon = (props: SingleValueProps<TokenSelectValue>) => {
  const { value } = props.selectProps
  return (
    <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
      <Icon name={`${(value as TokenSelectValue).icon}_color`} size="32px" sx={{ mr: 2, ml: 2 }} />
      {(value as TokenSelectValue).label}
    </Flex>
  )
}

interface TokenSelectProps {
  tabs: { name: string; icon: string }[]
  handleChange: (tab: string) => void
}

export function TokenSelect({ tabs, handleChange }: TokenSelectProps) {
  const defaultValue = { label: tabs[0].name, value: tabs[0].name, icon: tabs[0].icon }
  const [option, setOption] = useState(defaultValue)

  function handleSelectChange(option: ValueType<TokenSelectValue>) {
    setOption(option as TokenSelectValue)
    handleChange((option as TokenSelectValue).value)
  }

  return (
    <ReactSelect<TokenSelectValue>
      options={tabs.map((tab) => ({ value: tab.name, label: tab.name, icon: tab.icon }))}
      defaultValue={defaultValue}
      onChange={handleSelectChange}
      styles={customStyles}
      value={option}
      components={{ Option: OptionWithIcon, SingleValue: InputWithIcon }}
    />
  )
}
