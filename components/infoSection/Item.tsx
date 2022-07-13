import BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { AppSpinner } from 'helpers/AppSpinner'
import { ReactNode, useState } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Flex, Grid, IconButton, Text } from 'theme-ui'

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
      <Flex>
        {label && (
          <Text
            sx={{
              mr: 'auto',
              color: labelColorPrimary ? 'primary100' : theme.colors.neutral80,
            }}
            as="p"
          >
            {label}
          </Text>
        )}
        <Box>
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
                  <IconButton
                    onClick={() => setOpen(!open)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      width: 'fit-content',
                      display: 'flex',
                      justifyContent: 'right',
                      ml: 1,
                    }}
                  >
                    <ExpandableArrow
                      direction={open ? 'up' : 'down'}
                      sx={{
                        pr: 0,
                      }}
                    />
                  </IconButton>
                )}
              </>
            )}
          </Text>
        </Box>
      </Flex>
      {open && (
        <>
          {subLabel && (
            <Text
              sx={{
                fontWeight: 400,
                color: theme.colors.neutral80,
              }}
            >
              {subLabel}
            </Text>
          )}
          <Grid
            as="ul"
            gap={2}
            sx={{ p: 0, m: 0, pl: dropDownElementType ? 'unset' : 3, mt: 2, listStyle: 'none' }}
          >
            {dropdownValues &&
              dropdownValues.map((item, idx) => <Item {...item} key={item.label || idx} />)}
          </Grid>
        </>
      )}
    </Box>
  )
}
