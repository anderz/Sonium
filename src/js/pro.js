/* 
 * Pro - A tiny JavaScript prototype framework.
 * Copyright and licence free.
 */

(function (ns) {

    const SF = {}
    SF.values = {}
    SF.listeners = {}
  
    /*
     * Registry for prototypes, functions, constants and symbols.
     * Design pattern: 
     * Name starts with lower case: function or symbol
     * Name starts with one upper case: prototype
     * Name starts with two upper case: constant
     */
    const Registry = {}
    Registry.prototypes = {}
    Registry.functions = {}
    Registry.constants = {}
    Registry.symbols = {}
    Registry.symbolDescriptions = {}
    function getType(name, value) {
        let type = 'error'
        const a = name[0]
        const al = a.toLowerCase()
        if (name.length == 1) {
            if (a == al && typeof value == 'string') {
                type = 'symbol'
            } else if (a == al && typeof value == 'function') {
                type = 'function'
            } else if (a == al) {
                type = 'error'
            } else {
                type = 'prototype'
            }
        } else {
            const b = name[1]
            const bl = b.toLowerCase()
            if (a == al && typeof value == 'string') {
                type = 'symbol'
            } else if (a == al && typeof value == 'function') {
                type = 'function'
            } else if (a == al) {
                type = 'error'
            } else if (a != al && b != bl) {
                type = 'constant'
            } else {
                type = 'prototype'
            }
        }
        return type
    }
    function registerPrototype(prototypeName, prototypeObject) {
        const error = 'Registry.register() [prototype]:'
        if (Registry.prototypes[prototypeName]) {
            throw new Error(`${error} Prototype name ${prototypeName} already registered.`)
        }
        if (prototypeObject in Registry.prototypes) {
            throw new Error(`${error} Prototype object "${prototypeObject}" already registered.`)
        }
        Registry.prototypes[prototypeName] = prototypeObject
    }
    function registerFunction(functionName, fn) {
        const error = 'Registry.register() [function]:'
        if (Registry.functions[functionName]) {
            throw new Error(`${error} Function name ${functionName} already registered.`)
        }
        if (fn in Registry.functions) {
            throw new Error(`${error} Function ${fn} already registered.`)
        }
        if (Registry.symbols[functionName]) {
            throw new Error(`${error} Function name "${functionName}" already registered as a symbol.`)
        }
        Registry.functions[functionName] = fn
    }
    function registerConstant(constantName, constant) {
        const error = 'Registry.register() [constant]:'
        if (Registry.constants[constantName]) {
            throw new Error(`${error} Constant name ${constantName} already registered.`)
        }
        if (constant in Registry.constants) {
            throw new Error(`${error} Constant "${constant}" already registered.`)
        }
        Registry.contants[constantName] = constant
    }
    function registerSymbol(symbolName, symbolDescription) {
        const error = 'Registry.register() [symbol]:'
        if (Registry.symbols[symbolName]) {
            throw new Error(`${error} Symbol ${symbolName} already registered.`)
        }
        if (Registry.symbolDescriptions[symbolDescription]) {
            throw new Error(`${error} Symbol description "${symbolDescription}" already registered.`)
        }
        if (Registry.functions[symbolName]) {
            throw new Error(`${error} Symbol name "${symbolName}" already registered as a function.`)
        }
        Registry.symbolDescriptions[symbolDescription] = symbolName
        Registry.symbols[symbolName] = Symbol.for(symbolDescription)
    }
    Registry.register = function(name, value) {
        const error = 'Registry.register():'
        if (!name) {
            throw new Error(`${error} Parameter name missing.`)
        }
        if (typeof name != 'string') {
            throw new Error(`${error} Parameter name must be a string.`)
        }
        if (value === undefined) {
            throw new Error(`${error} Parameter value missing.`)
        }
        switch (getType(name, value)) {
            case 'prototype':
                registerPrototype(name, value)
                break
            case 'function':
                registerFunction(name, value)
                break
            case 'constant':
                registerConstant(name, value)
                break
            case 'symbol':
                registerSymbol(name, value)
                break
            case 'error':
                if (name[0] == name[0].toLocaleLowerCase()) {
                    throw new Error(`${error} Registration of name "${name}" ` +
                        'must either be a function or a symbol description (string).')             
                }
                break
            default:
                throw new Error(`${error} Design pattern not matched.`)             
        }
    }
    Registry.for = function(name) {
        const error = 'Registry.for():'
        if (!name) {
            throw new Error(`${error} Parameter name missing.`)
        }
        if (typeof name != 'string') {
            throw new Error(`${error} Parameter name must be a string.`)
        }
        let type = getType(name)
        const a = name[0]
        const al = a.toLocaleLowerCase()
        if (a == al) {
            if (name in Registry.symbols) {
                type = 'symbol'
            } else if (name in Registry.functions) {
                type = 'function'
            } else {
                throw new Error(`${error} Name "${name}" is not registered.`)
            }
        }
        switch (type) {
            case 'prototype':
                const prototype = Registry.prototypes[name]
                if (!prototype) {
                    throw new Error(`${error} Prototype with name "${name}" is not registered.`)
                }
                return prototype
            case 'function':
                const fn = Registry.functions[name]
                if (!fn) {
                    throw new Error(`${error} Function with name "${name}" is not registered.`)
                }
                return fn
            case 'constant':
                const constant = Registry.constants[name]
                if (!constant) {
                    throw new Error(`${error} Constant with name "${name}" is not registered.`)
                }
                return constant
            case 'symbol':
                const symbol = Registry.symbols[name]
                if (!symbol) {
                    throw new Error(`${error} Symbol with name "${name}" is not registered.`)
                }
                return symbol
            default:
                return null
        }
    }

    /*
     * Method for creating and adding elements.
     * @param {string/object} tag
     * @param (object) parent
     * @param (string) className
     * @param (string) text
     * @return {object}
     */
    function c(tag, parent, className, text) {
        let element
        if (typeof tag === 'string') {
            element = document.createElement(tag)
        } else if (tag.element) {
            element = tag.element
        } else {
            element = tag
        }
        if (className) {
            element.className = className
        }
        if (text) {
            element.innerHTML = text
        }
        if (parent) {
            parent.appendChild(element)
        }
        return element
    }

    /*
     * Method for creating objects from prototype objects.
     * @param {object} prototype
     * @return {object} constructed object
     */
    function o(prototype, ...args) {
        let arg = null,
        key = null 
        const obj = Object.create(prototype)

        for (arg of args) {
            for (key in arg) {
                if (!obj[key]) {
                    if (arg.hasOwnProperty(key)) {
                        obj[key] = arg[key]
                    }
                }
            }
        }
        if (obj.constructor) {
            obj.constructor.call(obj)
        }
        return obj
    }

    function isValidParameter(name, label) {
        if (!name) {
            throw new Error(label + ': Name cannot be empty.')
        }
        if (typeof name != 'symbol') {
            throw new Error(`${label}: ${name} is not a symbol.`)
        }
    }

    /*
     * Parameterized setter.
     * @param {Symbol} name of the value to set
     * @param {anytype} value to set
     */
    function set(name, value) {
        isValidParameter(name, 'set()')
        SF.values[name] = value
        const listeners = SF.listeners[name]
        if (listeners) {
            for (const listener of listeners) {
                listener(value)
            }    
        }
    }

    /*
     * Parameterized getter.
     * @param {Symbol} name of the value to get
     * @return {anytype} value
     */
    function get(name) {
        isValidParameter(name, 'get()')
        if (!(name in SF.values)) {
            throw new Error(`get(): No value set for ${name.toString()}.`)
        }
        return SF.values[name]
    }

    /*
     * Listen to change of the value for the specified parameter.
     * @param {Symbol} name of the value to listen to. 
     * @param {function} callback to call when the value changes. 
     */
    function listen(name, callback) {
        isValidParameter(name, 'listen()')
        let listeners = SF.listeners[name]
        if (!listeners) {
            listeners = []
            SF.listeners[name] = listeners
        }
        listeners.push(callback)
    }
    
    Registry.register('get', get)
    Registry.register('set', set)
    Registry.register('listen', listen)
    Registry.register('c', c)
    Registry.register('o', o)

    ns.Registry = Registry
}(this))