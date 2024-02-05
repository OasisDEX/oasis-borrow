import { useMigrationsClient } from 'features/migrations/migrationsClient'
import React, { createContext } from 'react'

export const MigrationsContext = createContext<ReturnType<typeof useMigrationsClient>>({
  fetchMigrationPositions: () => Promise.resolve(undefined),
})

export const MigrationsProvider = (props: React.PropsWithChildren<{}>) => {
  const migrationsClient = useMigrationsClient()

  return (
    <MigrationsContext.Provider value={{ ...migrationsClient }}>
      {props.children}
    </MigrationsContext.Provider>
  )
}
