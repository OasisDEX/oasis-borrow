const elementBaseSize = 4

export const makeItLazy =
  (url: string) => (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    // get mouse position
    const { clientX, clientY } = ev
    // add overflow hidden to the body
    document.body.style.overflow = 'hidden'
    // add a new element to the body at the center of mouse position
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.left = `${clientX - elementBaseSize / 2}px`
    el.style.top = `${clientY - elementBaseSize / 2}px`
    el.style.width = `${elementBaseSize}px`
    el.style.height = `${elementBaseSize}px`
    el.style.zIndex = '9999'
    el.style.borderRadius = '50%'
    el.style.background = '#1c1c1c'
    el.style.transition = 'width 1s, height 1s, left 1s, top 1s, border-radius 1s'
    document.body.appendChild(el)
    // trigger the growth
    requestAnimationFrame(() => {
      el.style.width = '200vw'
      el.style.height = '200vw'
      el.style.left = `${clientX - (100 * window.innerWidth) / 100}px`
      el.style.top = `${clientY - (100 * window.innerHeight) / 100}px`
      el.style.borderRadius = '50%'
    })
    setTimeout(() => {
      window.location.replace(url)
    }, 700)
  }
