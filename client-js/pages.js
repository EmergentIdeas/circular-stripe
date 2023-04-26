
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
		cs.addEventListener('dotClicked', (evt) => {
			let { ind, dotElement, itemElement, itemCurrentPosition } = evt
			console.log(`dot clicked: ${ind} - ${itemElement.getAttribute('data-original-position')} - ${itemCurrentPosition}`)
		})
		cs.addEventListener('itemClicked', (evt) => {
			let { ind, itemElement} = evt
			console.log(`item clicked: ${ind} - ${itemElement.innerText}`)
		})
	}
})



