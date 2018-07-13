/* Sonium GUI components. */

/* global Registry */

(function() {

  const COLOR = Registry.register('COLOR', '#e0e0e0')
  const BACKGROUND = Registry.register('BACKGROUND', '#202830')
  const init = Registry.register('init', 'Test app init.')
  const globalWidth = Registry.register('globalWidth', 'Total width of the GUI screen in pixels.')

  const o = Registry.for('o')
  const c = Registry.for('c')
  const get = Registry.for('get')
  const listen = Registry.for('listen')

  const COLORS = {}
  COLORS.main = '#152028'
  COLORS.rim = '#121820'
  COLORS.lightRim = '#454550'
  COLORS.light = '#4080ff'
  COLORS.reflex = '#253038'
  COLORS.screen = "#101818"
  COLORS.shadow = 'rgba(0, 0, 0, 0.25)'

  const Component = {}

  function percent(size) {
    return '' + size + '%'
  }
  
  function fontString(size) {
    return '' + Math.round(size * 100) / 100 + 'px sans-serif'
  }
  
  function fontSize() {
    return get(globalWidth) * 0.015
  }
  
  function drawText(ctx, text, x, y, fontStr, align='center') {
    if (!fontStr) {
      fontStr = fontString(fontSize())
    }
    ctx.font = fontStr
    ctx.fillStyle = COLOR
    ctx.textAlign = align
    ctx.fillText(text, x, y);
  }
  
  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.stroke();
  }
  
  const Flex = o(Component)
  Flex.constructor = function() {
    if (!this.element) {
      const div = c('div')
      div.style.width = percent(100)
      div.style.height = percent(100)
      this.element = div
    }
    this.element.style.display = 'flex'
    this.element.style.flexWrap = 'nowrap'
    this.element.style.justifyContent = 'center'
    this.element.style.alignItems = 'center'
  }
  Flex.top = function(height) {
    this.element.style.flexDirection = 'column'
    const top = c('div', this.element)
    top.style.width = percent(100)
    top.style.height = percent(height)
    const bottom = c(o(Flex), this.element)
    bottom.style.width = percent(100)
    bottom.style.height = percent(100 - height)
    this.element = bottom
    return o(Flex, {element: top})
  }
  Flex.left = function(width) {
    this.element.style.flexDirection = 'row'
    const top = c('div', this.element)
    top.style.width = percent(width)
    top.style.height = percent(100)
    const bottom = c(o(Flex), this.element)
    bottom.style.width = percent(100 - width)
    bottom.style.height = percent(100)
    this.element = bottom
    return o(Flex, {element: top})
  }
  Flex.addTop = function(el, height) {
    this.element.style.flexDirection = 'column'
    const div = c('div', this.element)
    div.style.width = percent(100)
    div.style.height = percent(height)
    c(el, div)  
  }
  Flex.addLeft = function(el, width) {
    this.element.style.flexDirection = 'row'
    const div = c('div', this.element)
    div.style.width = percent(width)
    div.style.height = percent(100)
    c(el, div)  
  }

  const isCanvasResized = function(canvas) {
    const parent = canvas.parentElement
    if (!parent) {
      return false
    }
    const width = parent.offsetWidth
    const height = parent.offsetHeight
    return width != canvas.width || height != canvas.height

  }
  const Canvas = o(Component)
  Canvas.constructor = function() {
    const canvas = c('canvas')
    canvas.width = 0
    canvas.height = 0
    canvas.style.backgroundColor = BACKGROUND
    this.element = canvas
    listen(init, () => this.draw())
    document.addEventListener('mousemove', (event) => {
      if (event.buttons == 1 && isCanvasResized(canvas)) {
        this.draw()
      }
    })
  }
  
  Canvas.draw = function() {
    const canvas = this.element
    const parent = canvas.parentElement
    if (!parent) {
      return false
    }
    if (isCanvasResized(canvas)) {
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    return true
  }
  
  const Header = o(Canvas)
  Header.constructor = function() {
    Canvas.constructor.call(this)
  }
  Header.draw = function() {
    Canvas.draw.call(this)
    const label = this.label
    if (!label) {
      return
    }
    const size = get(globalWidth)
    const canvas = this.element
    const width = canvas.width
    const ctx = canvas.getContext('2d')
    const fontSize = size / 55
    const fontStr = 'bold ' + fontString(fontSize)
    ctx.font = fontStr
    const textWidth = ctx.measureText(label).width
    const y = size / 75
    const x0 = size / 100
    const x1 = size / 40
    const x2 = x1 + textWidth * 1.45
    const x3 = width - x0
    drawText(ctx, this.label, (x1 + x2) / 2, y * 1.5, fontStr)
    ctx.beginPath()
    ctx.lineWidth = size / 240
    ctx.strokeStyle = COLOR
    ctx.lineCap = 'round'
    ctx.moveTo(x0, y)
    ctx.lineTo(x1, y)
    ctx.moveTo(x2, y)
    ctx.lineTo(x3, y)
    ctx.stroke()    
  }
  
  const Checkbox = o(Canvas)
  Checkbox.constructor = function() {
    Canvas.constructor.call(this)
  }
  Checkbox.draw = function() {
    Canvas.draw.call(this)
    const canvas = this.element
    const size = get(globalWidth) / 50
    const x = 0
    const y = (canvas.height - size) / 2
    const r = size / 8
    const l = size / 4
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = COLORS.main
    ctx.fillRect(x, y, size, size)
    ctx.strokeStyle = COLORS.rim
    ctx.lineWidth = size / 6
    roundedRect(ctx, x, y, size, size, r)
    ctx.beginPath()
    ctx.moveTo(x + r / 2, y + size)
    ctx.strokeStyle = COLORS.lightRim
    ctx.lineTo(x + size - r / 2, y + size)
    ctx.lineWidth = size / 10
    ctx.stroke()
    ctx.fillStyle = COLORS.reflex
    ctx.fillRect(x + l, y + l, size - 2 * l, size - 2 * l)
    if (this.label) {
      drawText(ctx, this.label, x + 1.3 * size, y + size * 0.8, null, 'left')
    }
  }
  
  const Waveform = o(Canvas)
  Waveform.constructor = function() {
    Canvas.constructor.call(this)
  }
  Waveform.draw = function() {
    Canvas.draw.call(this)
    const width = get(globalWidth) / 6
    const height = 0.62 * width
    const canvas = this.element
    const x = (canvas.width - width) / 1.75
    const y = (canvas.height - height) / 2
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = COLORS.screen
    ctx.fillRect(x, y, width, height)    
    ctx.strokeStyle = COLORS.rim
    ctx.lineWidth = width / 50
    const r = width / 20
    roundedRect(ctx, x, y, width, height, r)
    ctx.beginPath()
    ctx.moveTo(x + r / 2, y + height)
    ctx.strokeStyle = COLORS.lightRim
    ctx.lineTo(x + width - r / 2, y + height)
    ctx.stroke()
  }

  const Knob = o(Canvas)
  Knob.constructor = function() {
    this.value = 0
    this.mouseX = 0
    this.mouseY = 0
    this.newValue = 0
    let x = 0
    let y = 0
    let drag = false
    Canvas.constructor.call(this)
    this.element.addEventListener('mousedown', event => {
      event.preventDefault()
      x = event.clientX
      y = event.clientY
      drag = true;
    })
    document.addEventListener('mouseup', () => {
      if (drag) {
        this.value = this.newValue
      }
      drag = false
      this.mouseX = 0
      this.mouseY = 0
    })
    document.addEventListener('mousemove', event => {
      if (drag) {
        this.mouseX = event.clientX - x
        this.mouseY = event.clientY - y
        this.newValue = this.draw()
      }
    })
  }
  
  Knob.draw = function() {
    if ((typeof this.value) != 'number') {
      return
    }
    const amount = this.mouseX - this.mouseY
    if (!Canvas.draw.call(this)) {
      return this.value
    }
    const label = this.label
    const canvas = this.element
    const width = canvas.width
    const height = canvas.height
    const radius = get(globalWidth) / 50
    const centerX = width / 2
    const centerY = height / 2.4

    const ctx = canvas.getContext('2d')
    const knobColors = COLORS
    drawKnob(ctx, canvas, knobColors)
    const newValue = drawKnobDetails(ctx, canvas, amount, this.value)
    
    return newValue
        
    function drawKnob(ctx, canvas, colors) {
      drawText(ctx, label, centerX, centerY + radius * 2)
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radius, radius * 1.7, 0, 0, Math.PI)
      ctx.fillStyle = colors.shadow
      ctx.fill();
      ctx.beginPath()
      ctx.lineWidth = radius / 6;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = colors.main
      ctx.fill();
      ctx.strokeStyle = colors.rim
      ctx.stroke()
      ctx.beginPath()
      ctx.lineWidth = radius / 9.5;
      ctx.strokeStyle = colors.lightRim
      ctx.arc(centerX, centerY, radius, 1.05 * Math.PI, 1.95 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.93, Math.PI, 2 * Math.PI)
      ctx.closePath()
      ctx.fillStyle = colors.reflex
      ctx.fill();
    }

    function drawKnobDetails(ctx, canvas, amount, value) {
      value += amount / 100
      value = value < 0 ? 0 : value
      value = value > 1.0 ? 1.0 : value
      const minAngle = Math.PI * 0.75
      const maxAngle = Math.PI * 2.25
      const angle = minAngle + (maxAngle - minAngle) * value
      const indicatorLength = 0.6
      const start = (1 - indicatorLength) * radius
      const end = indicatorLength * radius
      let x0 = centerX + start * Math.cos(angle)
      let y0 = centerY + start * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.strokeStyle = COLOR
      ctx.lineWidth = radius * 0.14
      ctx.lineTo(x0 + end * Math.cos(angle), y0 + end * Math.sin(angle))
      ctx.stroke()
      
      const markerStart = 1.1
      const markerEnd = 1.45
      ctx.lineWidth = radius * 0.09

      x0 = centerX + radius * markerStart * Math.cos(minAngle)
      y0 = centerY + radius * markerStart * Math.sin(minAngle)
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      x0 = centerX + radius * markerEnd * Math.cos(minAngle)
      y0 = centerY + radius * markerEnd * Math.sin(minAngle)
      ctx.lineTo(x0, y0)
      ctx.stroke()
      
      x0 = centerX + radius * markerStart * Math.cos(maxAngle)
      y0 = centerY + radius * markerStart * Math.sin(maxAngle)
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      x0 = centerX + radius * markerEnd * Math.cos(maxAngle)
      y0 = centerY + radius * markerEnd * Math.sin(maxAngle)
      ctx.lineTo(x0, y0)
      ctx.stroke()
      
      return value
    }
  }
  
  const Osc = o(Flex)
  Osc.constructor = function() {
    Flex.constructor.call(this)
    const element = this.element
    let top = this.top(8)
    c(o(Header, {label:'OSC 1'}), top.element)
    top = this.top(30)
    let left = top.left(65)
    c(o(Waveform), left.element)
    top.addTop(c('div'), 4)
    top.addTop(o(Checkbox, {label:'Saw'}), 23)
    top.addTop(o(Checkbox, {label:'Triangle'}), 23)
    top.addTop(o(Checkbox, {label:'Square'}), 23)
    top.addTop(o(Checkbox, {label:'Sine'}), 23)
    top.addTop(c('div'), 4)

    left = o(Flex)
    left.addTop(o(Knob, {label:'Fine tune'}), 33)
    left.addTop(o(Knob, {label:'Octave'}), 33)
    left.addTop(o(Knob, {label:'FM'}), 34)
    this.addLeft(left, 34)

    const mid = o(Flex)
    mid.addTop(o(Knob, {label:'Phase'}), 33)
    mid.addTop(o(Knob, {label:'Pulse width'}), 33)
    mid.addTop(o(Knob, {label:'H-sync'}), 34)
    this.addLeft(mid, 33)

    const right = o(Flex)
    right.addTop(o(Knob, {label:'Unison'}), 33)
    right.addTop(o(Knob, {label:'Pan'}), 33)
    right.addTop(o(Knob, {label:'Level'}), 34)
    this.addLeft(right, 33)

    this.element = element
  }

  Registry.register('Flex', Flex)
  Registry.register('Canvas', Canvas)
  Registry.register('Osc', Osc)
}())