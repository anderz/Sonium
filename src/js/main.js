/* Sonium main script. */

/* global Registry */

(function() {

  Registry.register('maximizeHeader', 'Message for maximizing the header.')
  Registry.register('minimizeHeader', 'Message for minimizing the header.')

  const maximizeHeader = Registry.for('maximizeHeader')
  const minimizeHeader = Registry.for('minimizeHeader')

  const set = Registry.for('set')
  const listen = Registry.for('listen')
  const c = Registry.for('c')
  const o = Registry.for('o')

  const Device = {}
  Device.setDPI = function() {
    const devicePixelRatio = window.devicePixelRatio || 1
    Device.dpi = document.getElementById('dpi').offsetWidth * devicePixelRatio
  }
  Device.focus = function(el) {
    if (!Device.isHires()) {
      el.focus()
    }
  }
  Device.isHires = function() {
    if (!Device.dpi) {
      Device.setDPI()
    }
    return Device.dpi > 96
  }

  const App = {}
  App.constructor = function() {
    this.objects = []
    if (!this.element) {
      this.element = c('div', document.body, 'app')
    }
  }
  App.add = function(object) {
    if (object.element || object.nodeType) {
      this.objects.push(c(object, this.element))
    } else {
      this.objects.push(object)
    }
  }

  const Menu = {}
  Menu.constructor = function() {
    function clicked(uri) {
      window.location = uri
    }
    const currentPage = this.page
    const pages = [
      ['About', '/about'],
      ['Privacy', '/privacy'],
      ['Terms', '/terms'],
      ['Dev', '/dev'],
      ['Help', '/help'],
      ['&#9776;', 'minimize', 'icon-button']
    ]
    const table = c('table', null, 'menu')
    const tr = c('tr', table)

    function selectItem(event) {
      const pageIndex = event.currentTarget.pageIndex
      const selected = pages[pageIndex][1]
      if (selected == 'minimize') {
        set(minimizeHeader)
      } else {
        clicked(selected)
      }
    }

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const td = c('td', tr, 'menu-item')
      const button = c('button', td, page[2], page[0])
      if (page[0] == currentPage) {
        button.disabled = true
      }
      button.pageIndex = i
      button.addEventListener('click', selectItem)
    }
    this.element = table
  }

  const ObjectStorage = {}
  ObjectStorage.get = function(name) {
    let object = null
    try {
      object = JSON.parse(localStorage.getItem(name))
    } catch (e) {}
    return object
  }
  ObjectStorage.set = function(name, object) {
    try {
      localStorage.setItem(name, JSON.stringify(object))
    } catch (e) {}
  }

  const MaximizeButton = {}
  MaximizeButton.constructor = function() {
    const button = c('button', null, 'icon-button maximize-button', '&#9776;')
    button.addEventListener('click', function() {
      button.style.display = 'none'
      set(maximizeHeader)
    })
    button.style.display = ObjectStorage.get('maximizeHeader') ? 'none' : 'inline'
    this.element = button
    listen(maximizeHeader, function() {
      ObjectStorage.set('maximizeHeader', true)
      button.style.display = 'none'
    })
    listen(minimizeHeader, function() {
      button.style.display = 'inline'
    })
  }

  const Header = {}
  Header.constructor = function() {
    const header = c('div', null, 'header')
    const table = c('table', header, 'header-width')
    const tr = c('tr', table)
    let td = c('td', tr, 'header-logo')
    const a = c('a', td)
    a.href = '/'
    const title = 'Chrono'
    a.title = title
//    const img = c('img', a)
    const img = c('img')
    img.src = '/Chrono/safe/images/logo.png'
    img.title = title
    img.alt = title
    img.width = 160
    img.height = 53
    td = c('td', tr, 'header-menu')
    const menu = o(Menu, {
      page: this.page
    })
    c(menu, td)
    menu.element.style.display = ObjectStorage.get('maximizeHeader') ? 'inline-block' : 'none'
    this.element = header
    listen(maximizeHeader, function() {
      menu.element.style.display = 'inline-block'
    })
    listen(minimizeHeader, function() {
      ObjectStorage.set('maximizeHeader', false)
      menu.element.style.display = 'none'
    })
  }

  const Popup = {}
  Popup.constructor = function() {
    if (!this.content) {
      this.content = Popup.defaultContent
    }
    const parent = c('div')
    c('div', parent, 'overlay')
    const box = c('div', parent, 'popup')
    const outer = c('div', box, 'popup-outer')
    const inner = c('div', outer, 'popup-inner')

    this.content.call(this, inner, this.text)

    box.style.width = this.width + 'px'
    box.style.height = this.height + 'px'
    const topMargin = Math.round(this.height / 2)
    const leftMargin = Math.round(this.width / 2) - 10
    box.style.margin = '-' + topMargin + 'px 0px 0px -' + leftMargin + 'px'
    outer.style.width = box.style.width
    outer.style.height = box.style.height
    this.element = parent
  }
  Popup.defaultContent = function(parent, text) {
    const popup = this
    this.width = 400
    this.height = 200
    let div = c('div', parent, 'popup-content')
    c('span', div, 'popup-text', text)
    div = c('div', parent, 'popup-content-inner')
    const closeButton = c('button', div, null, 'Close')
    closeButton.addEventListener('click', function() {
      popup.close()
    })
  }
  Popup.open = function() {
    if (!Popup.anchor) {
      const anchor = c('div', document.body)
      anchor.style.display = 'none'
      Popup.anchor = anchor
    }
    c(this, this.anchor)
    Popup.anchor.style.display = 'block'
    if (this.focus) {
      this.focus()
    }
  }
  Popup.close = function() {
    Popup.anchor.style.display = 'none'
    if (Popup.anchor.firstChild) {
      Popup.anchor.removeChild(Popup.anchor.firstChild)
    }
  }

  const DialogPopup = o(Popup)
  DialogPopup.constructor = function() {
    function dialogContent(parent, text) {
      const popup = this
      this.width = 400
      this.height = 200
      let div = c('div', parent, 'popup-content')
      c('span', div, 'popup-text', text)
      div = c('div', parent, 'popup-content-inner')
      const yesButton = c('button', div, 'popup-dialog-yes-button', 'Yes')
      yesButton.addEventListener('click', popup.callback)
      const noButton = c('button', div, null, 'No')
      noButton.addEventListener('click', popup.close)
    }
    this.content = dialogContent
    Popup.constructor.call(this)
  }

  const TextFilter = {}
  TextFilter.keyCode = function(event) {
    return event.keyCode ? event.keyCode : event.which
  }
  TextFilter.preventDefault = function(event) {
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }
  TextFilter.isEnter = function(event) {
    const keyCode = this.keyCode(event)
    const enter = keyCode == 13
    if (enter) {
      this.preventDefault(event)
    }
    return enter
  }
  TextFilter.length = function(callback) {
    return function(event) {
      if (TextFilter.keyCode(event) == 13) {
        return
      }
      callback(event.currentTarget.value.length)
    }
  }
  TextFilter.limitInputCharacters = function(event) {
    const keyCode = event.keyCode ? event.keyCode : event.which
    const key = event.key
    if (key == 'ArrowRight' || key == 'ArrowLeft') {
      return
    }
    const s = String.fromCharCode(keyCode)
    if (!(/[a-zA-Z0-9\b]/).test(s)) {
      if (event.preventDefault) {
        event.preventDefault()
      } else {
        event.returnValue = false
      }
    }
  }
  TextFilter.limitPasteText = function(event, maxCharacters) {
    let pastedText
    if (event.clipboardData) {
      pastedText = event.clipboardData.getData('text/plain')
    } else {
      pastedText = window.clipboardData.getData('Text')
    }
    pastedText = pastedText.replace(/[^a-zA-Z0-9\b]/g, '')
    if (pastedText.length > MAX_TEXT) {
      pastedText = pastedText.substring(0, maxCharacters)
    }
    event.currentTarget.value = pastedText
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }

  const Format = {}

  const ErrorMessage = {}
  ErrorMessage.NO_NETWORK_CONNECTION = 'No network connection at the moment.'

  Registry.register('Device', Device)
  Registry.register('App', App)
  Registry.register('Popup', Popup)
  Registry.register('DialogPopup', DialogPopup)
  Registry.register('Header', Header)
  Registry.register('MaximizeButton', MaximizeButton)
  Registry.register('Format', Format)
}())