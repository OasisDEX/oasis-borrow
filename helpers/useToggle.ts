import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'

export function useToggle(
  initialState: boolean,
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState<boolean>(initialState)

  const toggle = useCallback(() => setState((state) => !state), [])

  return [state, toggle, setState]
}
