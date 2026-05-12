function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                return typeof child === 'object'
                    ? child
                    : createTextElement(child)
            }),
        },
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function renderBlocking(element, container) {
    const dom =
        element.type == 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(element.type)

    const isProperty = (key) => key !== 'children'

    Object.keys(element.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = element.props[name]
        })

    element.props.children.forEach((child) => render(child, dom))
    container.appendChild(dom)
}

function createDom(fiber) {
    const dom =
        fiber.type == 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(fiber.type)

    const isProperty = (key) => key !== 'children'

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = fiber.props[name]
        })

    return dom
}

let nextUnitOfWork = null
let wipRoot = null

function commitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextUnitOfWork = wipRoot
}

function workLoop(deadline) {
    let shouldYield = false

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while (index < elements.length) {
        const element = elements[index]

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }

        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }

    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber

    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

const Didact = {
    createElement,
    render,
}

const element = Didact.createElement(
    'div',
    { id: 'foo' },
    Didact.createElement('a', null, 'bar'),
    Didact.createElement('b')
)

Didact.render(element, document.getElementById('root'))
