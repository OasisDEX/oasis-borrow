import { RouterContext } from 'next/dist/next-server/lib/router-context'
import { useState } from 'react'
import Router from 'next/router'

function RouterMock(storyFn) {
  const [pathname, setPathname] = useState('/')

  const mockRouter = {
    query: {},
    pathname,
    prefetch: () => {},
    push: async (newPathname) => {
      setPathname(newPathname)
    },
  }

  Router.router = mockRouter

  return <RouterContext.Provider value={mockRouter}>{storyFn()}</RouterContext.Provider>
}

export default RouterMock
