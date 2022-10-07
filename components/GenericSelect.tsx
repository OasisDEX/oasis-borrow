import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { theme } from 'theme'
import { Box } from 'theme-ui'
interface GenericSelectOption {
  label: string
  value: string
}
interface GenericSelectProps {
  defaultValue?: GenericSelectOption
  isDisabled?: boolean
  isSearchable?: boolean
  name?: string
  onChange?: (value: GenericSelectOption) => void
  options: GenericSelectOption[]
  placeholder?: string
}

export function GenericSelect({
  defaultValue,
  isDisabled = false,
  isSearchable = false,
  name,
  onChange,
  options,
  placeholder,
}: GenericSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [value, setValue] = useState<GenericSelectOption | undefined>(defaultValue)

  return (
    <Box sx={{ position: 'relative' }}>
      <ReactSelect
        blurInputOnSelect={true}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        menuIsOpen={true}
        options={options}
        value={value}
        onBlur={() => {
          setIsOpen(false)
        }}
        onFocus={() => {
          setIsOpen(true)
        }}
        //
        components={{
          DropdownIndicator: null,
        }}
        styles={{
          control: (provided, { isFocused }) => ({
            ...provided,
            height: '54px',
            border: `1px solid ${isFocused ? theme.colors.primary100 : theme.colors.secondary100}`,
            boxShadow: 'none',
            borderRadius: theme.radii.medium,
            cursor: 'pointer',
            transition: 'border-color 200ms',
            '&:hover': {
              borderColor: isFocused ? theme.colors.primary100 : theme.colors.neutral70,
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.semiBold,
            color: theme.colors.primary100,
          }),
          menu: (provided) => ({
            ...provided,
            marginTop: theme.space[1],
            marginBottom: 0,
            border: `1px solid ${theme.colors.secondary100}`,
            borderRadius: theme.radii.large,
            boxShadow: theme.shadows.buttonMenu,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'opacity 200ms, transform 200ms',
          }),
          menuList: (provided) => ({
            ...provided,
            paddingTop: '12px',
            paddingBottom: '12px',
          }),
          option: (provided, { isSelected }) => ({
            ...provided,
            padding: '12px 16px',
            fontSize: theme.fontSizes[3],
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.primary100,
            backgroundColor: isSelected ? theme.colors.neutral30 : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 200ms',
            '&:hover': {
              backgroundColor: theme.colors.neutral30,
            },
          }),
        }}
        {...(name && { name })}
        {...(placeholder && { placeholder })}
        onChange={(option) => {
          const value = option as GenericSelectOption

          setValue(value)
          setIsOpen(false)
          if (onChange) onChange(value)
        }}
      />
      <ExpandableArrow
        direction={isOpen ? 'up' : 'down'}
        sx={{
          position: 'absolute',
          top: 0,
          right: '18px',
          bottom: 0,
          my: 'auto',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
