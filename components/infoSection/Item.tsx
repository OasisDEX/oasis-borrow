import BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { AppSpinner } from 'helpers/AppSpinner'
import { ReactNode, useState } from 'react'
import React from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

export interface DropDownValue {
  label?: string
  value: string | ReactNode
  secondaryValue?: string
}

export interface ItemProps {
  label?: string
  labelColorPrimary?: boolean
  subLabel?: string
  value?: string | BigNumber | ReactNode
  // Select element type if you wish to render custom components within a dropdown
  dropDownElementType?: 'element' | 'default'
  secondaryValue?: string
  dropdownValues?: DropDownValue[]
  isLoading?: boolean
  isHeading?: boolean
}

// TODO: Add tooltip and loading state
// Note: Use this to phase out the VaultInformationContainer & VaultInformation components
export function Item({
  label,
  subLabel,
  dropdownValues,
  value,
  secondaryValue,
  isLoading,
  dropDownElementType,
  labelColorPrimary,
  isHeading = false,
}: ItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      as="li"
      sx={{
        fontSize: 1,
        fontWeight: 'semiBold',
        listStyle: 'none',
      }}
    >
      <Flex
        sx={{
          cursor: !isLoading && dropdownValues?.length ? 'pointer' : 'auto',
        }}
        onClick={() => {
          !isLoading && dropdownValues?.length && setOpen(!open)
        }}
      >
        {label && (
          <Text
            {...(!isHeading
              ? {
                  as: 'p',
                  sx: {
                    mr: 'auto',
                    color: labelColorPrimary ? 'primary100' : 'neutral80',
                  },
                }
              : {
                  as: 'h4',
                  variant: 'paragraph3',
                  sx: {
                    color: 'primary100',
                    fontWeight: 'semiBold',
                  },
                })}
          >
            {label}
          </Text>
        )}
        <Text
          sx={{
            color: 'primary100',
            display: 'flex',
            alignItems: 'center',
          }}
          as="div"
        >
          {isLoading ? (
            <AppSpinner />
          ) : (
            <>
              {value && <>{React.isValidElement(value) ? value : `${value}`}</>}
              {secondaryValue && (
                <>
                  <VaultChangesInformationArrow />
                  {`${secondaryValue}`}
                </>
              )}
              {dropdownValues?.length && (
                <ExpandableArrow
                  direction={open ? 'up' : 'down'}
                  sx={{
                    mt: !isHeading ? 0 : '2px',
                    ml: 2,
                  }}
                />
              )}
            </>
          )}
        </Text>
      </Flex>
      {!isLoading && open && (
        <>
          {subLabel && (
            <Text
              sx={{
                fontWeight: 400,
                color: 'neutral80',
              }}
            >
              {subLabel}
            </Text>
          )}
          {dropdownValues && (
            <Grid
              as="ul"
              gap={!isHeading ? 2 : 3}
              sx={{ p: 0, m: 0, pl: dropDownElementType ? 'unset' : 3, mt: 3, listStyle: 'none' }}
            >
              {dropdownValues.map((item, idx) => (
                <Item {...item} key={item.label || idx} />
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  )
}
