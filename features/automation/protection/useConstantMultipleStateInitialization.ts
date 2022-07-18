import { useAppContext } from 'components/AppContextProvider'
import { useEffect } from 'react'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
export const INITIAL_MULTIPLIER_SELECTED = 2

export function useConstantMultipleStateInitialization() {
    const { uiChanges } = useAppContext()

    useEffect(() => {
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'multiplier',
            multiplier: INITIAL_MULTIPLIER_SELECTED
        })
    })

}
