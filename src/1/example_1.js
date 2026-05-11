/* Notice  pragma comment I use here: */
/** @jsx createElement */
const createElement = (type, props, ...children) => {
    if (props === null) props = {}
    return { type, props, children }
}

/* Helper method for pretty VDOM display */
const prettyVDOM = (vdom) => JSON.stringify(vdom, null, 4)

/* Example #1: Simple text */
document.getElementById('one').textContent = prettyVDOM(
    createElement('div', null, 'Hello World!')
)

/* Example #2: Simple nested list example */
document.getElementById('two').textContent = prettyVDOM(
    createElement(
        'ul',
        { className: 'some-list' },
        createElement('li', { className: 'some-list__item' }, 'One'),
        createElement('li', { className: 'some-list__item' }, 'Two')
    )
)
