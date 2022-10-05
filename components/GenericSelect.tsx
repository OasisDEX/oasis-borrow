import React, { useState } from 'react'
import ReactSelect from 'react-select'

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
    <ReactSelect
      blurInputOnSelect={true}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      menuIsOpen={true}
      options={options}
      value={value}
      onFocus={() => {
        setIsOpen(true)
      }}
      onBlur={() => {
        setIsOpen(false)
      }}
      styles={{
        menu: (provided) => ({
          ...provided,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
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
  )
}
