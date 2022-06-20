import { ActionPills } from "components/ActionPills";
import { Item } from "components/infoSection/Item";
import React, { useState } from "react";

export type GAS_PERCENTAGE_TYPES = 'FIVE' | 'TEN' | 'TWELVE_POINT_FIVE' | 'NO_LIMIT';

export function MaxGasPrice() {
  const [active, setActiveItem] = useState('FIVE' as GAS_PERCENTAGE_TYPES)

  return (
    <Item
      label="Max Gas Fee (% of Transaction Value)"
      labelColorPrimary
      dropDownElementType="element"
      subLabel="Select the maximum gas fee you are willing to spend as % of the value of the Vault."
      dropdownValues={[
        {
          value: (
            <>
              <ActionPills
                active={active}
                variant='secondary'
                items={[
                  {
                    id: 'FIVE',
                    label: '5%',
                    action: () => {
                      setActiveItem('FIVE')
                    },
                  },
                  {
                    id: 'TEN',
                    label: '10%',
                    action: () => {
                      setActiveItem('TEN')
                    },
                  },
                  {
                    id: 'TWELVE_POINT_FIVE',
                    label: '12.5%',
                    action: () => {
                      setActiveItem('TWELVE_POINT_FIVE')
                    },
                  },
                  {
                    id: 'NO_LIMIT',
                    label: 'No Limit',
                    action: () => {
                      setActiveItem('NO_LIMIT')
                    },
                  },
                ]}
              />
            </>
          )
        }
      ]}
    />
  )
}