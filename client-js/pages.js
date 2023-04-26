window.require = require

let tri = require('tripartite')


// load templates like
//require('../views/test1.tri')

// and use like:
/*
let d = document.createElement('div')
d.innerHTML = tri.getTemplate('views/test1')({
	key1: 'value'
	, key2: 'value'
})
document.body.append(d)
*/

const CircularStripe = require('./circular-stripe')
window.addEventListener("load", function () {
	let cs
	let stripes = document.getElementsByClassName('circular-stripe-holder')
	if (stripes.length > 0) {
		window.cs = cs = new CircularStripe(stripes[0])
		setTimeout(function () {
			cs.center()
		})
		cs.addEventListener('center', (evt) => {
			let { nextItemOriginalIndex: org, nextItemIndex: now } = evt
			console.log(`Now positioning: ${org} (${now})`)
		})
	}
})



