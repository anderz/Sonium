/* Sonium One script. */

/* global Registry */

(function() {
  
  const o = Registry.for('o')
  const c = Registry.for('c')
  const set = Registry.for('set')
  const listen = Registry.for('listen')
  const Flex = Registry.for('Flex')
  const Osc = Registry.for('Osc')
  const init = Registry.for('init')
  const globalWidth = Registry.for('globalWidth')
  const BACKGROUND = Registry.for('BACKGROUND')
  
  const SoniumOne = {}
  SoniumOne.constructor = function() {
    set(globalWidth, this.width)
    const aspectRatio = this.width / this.height
    const minWidth = 400
    const div = c('div');
    div.style.background = BACKGROUND
    div.style.width = '' + this.width + 'px'
    div.style.height = '' + this.height + 'px'
    div.style.minWidth = '' + minWidth + 'px'
    div.style.minHeight = '' + Math.round(minWidth / aspectRatio) + 'px'
    div.style.resize = 'both'
    div.style.overflow = 'hidden'
    div.style.marginLeft = 'auto'
    div.style.marginRight = 'auto'
    
    const innerDiv = c('div', div)
    innerDiv.style.width = div.style.width
    innerDiv.style.height = div.style.height
    listen(init, () => {
      const parent = div.parentElement
      div.style.maxWidth = '' + parent.offsetWidth + 'px'
    })

    document.addEventListener('mousemove', (event) => {
      if (event.buttons == 1) {
        const parent = innerDiv.parentElement
        if (!parent) {
          return false
        }
        const width = parent.offsetWidth
        const height = parent.offsetHeight
        const newRatio = width / height
        let newWidth = width
        let newHeight = height
        if (newRatio > aspectRatio) {
          newWidth = newHeight * aspectRatio
        } else {
          newHeight = newWidth / aspectRatio
        }
        innerDiv.style.width = '' + Math.round(newWidth) + 'px'
        innerDiv.style.height = '' + Math.round(newHeight) + 'px'
        set(globalWidth, newWidth)
      }
    })
    document.addEventListener('mouseup', () => {
      if (div.offsetWidth != innerDiv.offsetWidth ||
          div.offsetHeight != innerDiv.offsetHeight) {
        div.style.width = innerDiv.style.width
        div.style.height = innerDiv.style.height
        set(globalWidth, div.offsetWidth)
      }
    })
    
    const bottomFlex = o(Flex)
    c(bottomFlex, innerDiv)
    const topFlex = bottomFlex.top(50)
    bottomFlex.element.style.background = 'red'
    c('span', bottomFlex.element, null, 'ssgs')
    const oscFlex = topFlex.left(30)
    c(o(Osc), oscFlex.element)    
    this.element = div
  }
  
  Registry.register('SoniumOne', SoniumOne)
}())
