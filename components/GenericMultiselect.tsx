import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { TokensGroup } from 'components/TokensGroup'
import { getAppConfig } from 'helpers/config'
import { toggleArrayItem } from 'helpers/toggleArrayItem'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'
import type { FeaturesEnum } from 'types/config'

export interface GenericMultiselectOption {
  icon?: string
  image?: string
  label: string
  token?: string
  value: string
  featureFlag?: FeaturesEnum
}

export interface GenericMultiselectProps {
  icon?: string
  initialValues?: string[]
  label: string
  options: GenericMultiselectOption[]
  onChange: (value: string[]) => void
}

function GenericMultiselectIcon({
  icon,
  image,
  label,
  token,
}: {
  icon?: string
  image?: string
  label: string
  token?: string
}) {
  return (
    <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}>
      {token && <TokensGroup tokens={[token]} forceSize={32} />}
      {icon && <Icon size={32} name={icon} sx={{ verticalAlign: 'bottom' }} />}
      {image && (
        <Image
          src={image}
          alt={label}
          sx={{ width: '26px', height: '26px', verticalAlign: 'bottom' }}
        />
      )}
    </Box>
  )
}

function GenericMultiselectItem({
  hasCheckbox = true,
  icon,
  image,
  isClearing = false,
  isDisabled = false,
  isSelected = false,
  token,
  label,
  onClick,
  value,
}: {
  hasCheckbox?: boolean
  isClearing?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  onClick: (value: string) => void
} & GenericMultiselectOption) {
  return (
    <Box
      as="li"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: isClearing ? '18px' : '12px',
        pr: 2,
        pl: hasCheckbox ? '44px' : 2,
        fontSize: 3,
        fontWeight: 'regular',
        color: isDisabled ? 'neutral80' : 'primary100',
        borderRadius: 'medium',
        transition: 'color 200ms, background-color 200ms',
        cursor: isDisabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        borderBottom: isClearing ? '1px solid' : 'none',
        borderColor: 'neutral30',
        '&:hover': {
          backgroundColor: isDisabled || isClearing ? 'transparent' : 'neutral30',
          fontWeight: !isDisabled && isClearing ? 'semiBold' : 'regular',
        },
      }}
      onClick={() => {
        if (!isDisabled) onClick(value)
      }}
    >
      {hasCheckbox && (
        <Box
          sx={{
            position: 'absolute',
            top: '12px',
            left: 2,
            width: '24px',
            height: '24px',
            backgroundColor: isSelected ? 'success10' : 'neutral10',
            border: '1px solid',
            borderColor: isSelected ? 'success100' : 'neutral60',
            borderRadius: 'small',
            transition: 'background-color 100ms, border-color 100ms',
          }}
        >
          <Icon
            size={12}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              margin: 'auto',
              opacity: isSelected ? 1 : 0,
              transition: 'opacity 100ms',
            }}
            name="checkmark"
            color="success100"
          />
        </Box>
      )}
      {isClearing && (
        <Icon
          size={24}
          name="clear_selection"
          sx={{ mr: 3, opacity: isDisabled ? 0.5 : 1, transition: '200ms opacity' }}
        />
      )}
      {(icon || image || token) && (
        <GenericMultiselectIcon label={label} icon={icon} image={image} token={token} />
      )}
      {label}
    </Box>
  )
}

export function GenericMultiselect({
  icon,
  initialValues = [],
  label,
  options,
  onChange,
}: GenericMultiselectProps) {
  const { t } = useTranslation()

  const didMountRef = useRef(false)
  const [values, setValues] = useState<string[]>(initialValues)
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const scrollRef = useRef<HTMLDivElement>(null)
  const optionsFeatureFlagsArray = options.map((option) =>
    option.featureFlag ? getAppConfig('features')[option.featureFlag] : true,
  )

  useEffect(() => {
    if (didMountRef.current) onChange(values.length ? values : options.map((item) => item.value))
    else didMountRef.current = true
  }, [values])

  function getSelectLabel(): ReactNode {
    switch (values.length) {
      case 0:
        return (
          <>
            {icon && <Icon name={icon} size={32} sx={{ flexShrink: 0, mr: '12px' }} />}
            {t('all')} {label.toLowerCase()}
          </>
        )
      case 1:
        const selected = options.filter((item) => item.value === values[0])[0]
        return (
          <>
            {(selected.icon || selected.image) && (
              <GenericMultiselectIcon
                label={selected.label}
                icon={selected.icon}
                image={selected.image}
              />
            )}
            {selected.label}
          </>
        )
      default:
        return (
          <>
            {icon && <Icon name={icon} size={32} sx={{ flexShrink: 0, mr: '12px' }} />}
            {t('selected')} {label.toLowerCase()}: {values.length}
          </>
        )
    }
  }

  return (
    <Box sx={{ position: 'relative', userSelect: 'none' }} ref={outsideRef}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          height: '56px',
          pr: '42px',
          pl: 3,
          border: '1px solid',
          borderColor: isOpen ? 'primary100' : 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          cursor: 'pointer',
          transition: 'border-color 200ms',
          '&:hover': {
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={toggleIsOpen}
      >
        <Text
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 2,
            fontWeight: 'semiBold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {getSelectLabel()}
          <ExpandableArrow
            size={12}
            direction={isOpen ? 'up' : 'down'}
            sx={{
              position: 'absolute',
              top: 0,
              right: '18px',
              bottom: 0,
              my: 'auto',
            }}
          />
        </Text>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: '100%',
          mt: 1,
          p: 2,
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 1,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Flex
          ref={scrollRef}
          as="ul"
          sx={{
            flexDirection: 'column',
            rowGap: 2,
            maxHeight: '342px',
            pl: 0,
            pr:
              scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                ? 2
                : 0,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'secondary100',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor:
                scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                  ? 'secondary60'
                  : 'transparent',
              borderRadius: 'large',
            },
          }}
        >
          <GenericMultiselectItem
            hasCheckbox={false}
            isClearing={true}
            isDisabled={values.length === 0}
            label={t('clear-selection')}
            onClick={() => {
              setValues([])
              setIsOpen(false)
            }}
            value=""
          />
          {options.map((option, index) =>
            optionsFeatureFlagsArray[index] ? (
              <GenericMultiselectItem
                isSelected={values.includes(option.value)}
                key={option.value}
                onClick={(value) => setValues(toggleArrayItem<string>(values, value))}
                {...option}
              />
            ) : null,
          )}
        </Flex>
      </Box>
    </Box>
  )
}
