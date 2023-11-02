import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { isTouchDevice } from 'helpers/isTouchDevice'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import { keyBy } from 'lodash'
import React, { useState } from 'react'
import ReactSelect, { components } from 'react-select'
import { theme } from 'theme'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Text } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { Icon } from './Icon'
import type { IconProps } from './Icon.types'
import type { styleFn, Styles } from 'react-select/src/styles'

type ReactSelectCSSProperties = ReturnType<styleFn>
type ReactSelectSimplifiedStyles = {
  [key in keyof Styles]: (state: any) => ReactSelectCSSProperties
}

export interface GenericSelectOption {
  label: string
  value: string
  icon?: IconProps['icon']
}
export interface GenericSelectProps {
  /**
   * For more info about custom styles options see: https://react-select.com/styles
   */
  customStyles?: ReactSelectSimplifiedStyles
  defaultValue?: GenericSelectOption
  expandableArrowSize?: number
  expandableArrowSx?: ThemeUIStyleObject
  iconSize?: number
  isDisabled?: boolean
  isSearchable?: boolean
  name?: string
  onChange?: (value: GenericSelectOption) => void
  options: GenericSelectOption[]
  placeholder?: string
  wrapperSx?: ThemeUIStyleObject
  iconPosition?: 'left' | 'right'
}

export function GenericSelect({
  customStyles = {},
  defaultValue,
  expandableArrowSize = 12,
  expandableArrowSx,
  iconSize = 32,
  iconPosition = 'left',
  isDisabled = false,
  isSearchable = false,
  name,
  onChange,
  options,
  placeholder,
  wrapperSx,
}: GenericSelectProps) {
  const isMobile = useOnMobile() && isTouchDevice
  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const [value, setValue] = useState<GenericSelectOption | undefined>(defaultValue)

  const optionsByValue = keyBy(options, 'value')

  const defaultStyles: ReactSelectSimplifiedStyles = {
    control: () => ({
      height: '54px',
      border: 'none',
      boxShadow: 'none',
      borderRadius: theme.radii.medium,
      cursor: 'pointer',
    }),
    valueContainer: () => ({
      width: '100%',
      height: '100%',
      padding: '0 42px 0 16px',
      overflow: 'visible',
      input: {
        position: 'absolute',
      },
    }),
    singleValue: () => ({
      position: 'relative',
      display: 'block',
      top: 'auto',
      width: '100%',
      maxWidth: 'none',
      padding: '12px 0',
      alignItems: 'center',
      margin: 0,
      fontSize: theme.fontSizes[2],
      fontWeight: theme.fontWeights.semiBold,
      color: theme.colors.primary100,
      overflow: 'hidden',
      transform: 'none',
    }),
    placeholder: () => ({
      fontSize: theme.fontSizes[2],
      fontWeight: theme.fontWeights.semiBold,
      color: theme.colors.neutral80,
    }),
    input: () => ({
      position: 'absolute',
      fontSize: theme.fontSizes[2],
      color: theme.colors.primary100,
    }),
    menu: () => ({
      marginTop: theme.space[1],
      marginBottom: 0,
      padding: '8px',
      border: `1px solid ${theme.colors.secondary100}`,
      borderRadius: theme.radii.medium,
      boxShadow: theme.shadows.buttonMenu,
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'opacity 200ms, transform 200ms',
    }),
    menuList: () => ({
      display: 'flex',
      flexDirection: 'column',
      rowGap: '8px',
      maxHeight: '340px',
      padding: 0,
    }),
    option: ({ isSelected }) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      borderRadius: '8px',
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
    indicatorsContainer: () => ({
      display: 'none',
    }),
  }
  const combinedStyles: Styles = [...Object.keys(defaultStyles), ...Object.keys(customStyles)]
    .filter((item, i, arr) => arr.indexOf(item) === i)
    .reduce(
      (o, key) => ({
        ...o,
        [key]: (provided: ReactSelectCSSProperties, state: any) => {
          const styleKey = key as keyof Styles

          return {
            ...provided,
            ...(defaultStyles[styleKey] && defaultStyles[styleKey]!(state)),
            ...(customStyles[styleKey] && customStyles[styleKey]!(state)),
          }
        },
      }),
      {},
    )

  return (
    <Box
      sx={{
        position: 'relative',
        border: `1px solid ${isOpen ? theme.colors.primary100 : theme.colors.secondary100}`,
        borderRadius: 'medium',
        transition: 'border-color 200ms',
        pointerEvents: isDisabled ? 'none' : 'auto',
        '&:hover': {
          borderColor: isOpen ? theme.colors.primary100 : theme.colors.neutral70,
        },
        ...wrapperSx,
      }}
    >
      {isMobile && (
        <select
          name={name}
          defaultValue={value?.value}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 3,
            opacity: 0,
          }}
          onChange={(e) => {
            const currentValue = optionsByValue[e.target.value]

            setValue(currentValue)
            if (onChange) onChange(currentValue)
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <ReactSelect
        blurInputOnSelect={true}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        // this prop hardcoded to true, because react-select removes its options list from DOM when it's not used. for the purpose of seo and animations,
        // options list is always renderded and it's visibility is decided by useState instead of built-in react-select solution
        menuIsOpen={true}
        options={options}
        styles={combinedStyles}
        value={value}
        components={{
          DropdownIndicator: null,
          Control: (props) => (
            <Box ref={componentRef} onClick={toggleIsOpen}>
              <components.Control {...props} />
            </Box>
          ),
          SingleValue: ({ children, data, ...props }) => (
            <components.SingleValue data={data} {...props}>
              {data.icon ? (
                <>
                  {iconPosition === 'left' && (
                    <Icon
                      size={iconSize}
                      sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, m: 'auto' }}
                      icon={data.icon}
                    />
                  )}
                  <Text as="span" sx={{ pl: `${iconSize + 12}px` }}>
                    {children}
                  </Text>
                  {iconPosition === 'right' && (
                    <Icon
                      size={iconSize}
                      sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, m: 'auto' }}
                      icon={data.icon}
                    />
                  )}
                </>
              ) : (
                children
              )}
            </components.SingleValue>
          ),
          Option: ({ children, data, ...props }) => (
            <components.Option data={data} {...props}>
              {data.icon && iconPosition === 'left' && (
                <Icon size={iconSize} sx={{ flexShrink: 0, mr: '12px' }} icon={data.icon} />,
              )}
              {children}
              {data.icon && iconPosition === 'right' && (
                <Icon size={iconSize} sx={{ flexShrink: 0, ml: '12px' }} icon={data.icon} />,
              )}
            </components.Option>
          ),
        }}
        onChange={(option) => {
          const currentValue = option as GenericSelectOption

          setValue(currentValue)
          setIsOpen(false)
          if (onChange) onChange(currentValue)
        }}
        {...(name && { name })}
        {...(placeholder && { placeholder })}
      />
      <ExpandableArrow
        size={expandableArrowSize}
        direction={isOpen ? 'up' : 'down'}
        sx={{
          position: 'absolute',
          top: 0,
          right: '18px',
          bottom: 0,
          my: 'auto',
          pointerEvents: 'none',
          ...expandableArrowSx,
        }}
      />
    </Box>
  )
}
