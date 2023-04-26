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


let positionAttributeName = 'data-original-position'

class CircularStripe {
	/**
	 * Expects an element like .circular-stripe-holder with markup roughly like:
	 * 
	 * 	<div class="circular-stripe-holder">
	 *		<div class="circular-stripe">
	 *			<div class="mover">
	 *				<div>content</div><div>content</div><div>content</div>
	 *			</div>
	 * 		</div>
	 * 		<button class="previous">previous</button>
	 * 		<button class="next">next</button>
	 * 		<div class="dots"></div>
	 * 	</div>
	 * 
	 * @param {Element} stripeElementHolder The holder of the working elements for the circular stripe
	 */
	constructor(stripeElementHolder) {

		// Setup working properties
		this.animationDuration = 300
		this.stepSize = 5
		this.sidePadding = 1000

		// find possible parts
		this.stripeElementHolder = stripeElementHolder
		this.stripeElement = stripeElementHolder.querySelector('.circular-stripe')
		this.mover = this.stripeElement.querySelector('.mover')
		this.nextButton = this.stripeElementHolder.querySelector('.next')
		this.previousButton = this.stripeElementHolder.querySelector('.previous')
		this.dots = this.stripeElementHolder.querySelector('.dots')

		// mark the items with their original positions
		for (let i = 0; i < this.mover.children.length; i++) {
			this.mover.children[i].setAttribute(positionAttributeName, i)
		}

		this._addEventListeners()
	}
	
	/**
	 * Configures event listeners for the possible components in the stripe
	 */
	_addEventListeners() {
		this.stripeElement.addEventListener('scroll', evt => {
			window.requestAnimationFrame(() => {
				if (!this.animating) {
					this.rebalance()
				}
			})
		})

		if (this.nextButton) {
			this.nextButton.addEventListener('click', evt => {
				this.centerItemToRight()
			})
		}
		if (this.previousButton) {
			this.previousButton.addEventListener('click', evt => {
				this.centerItemToLeft()
			})
		}

		this.addEventListener('center', (evt) => {
			this._onCenterItem(evt.nextItemOriginalIndex, evt.nextItemIndex)
		})
		
		window.addEventListener('resize', (evt) => {
			this.rebalance()
		})

	}

	/**
	 * Listen for events from this component.
	 * The available events are: 
	 * center: an item is being explicitly centered
	 * dotClicked: the user has clicked one of the tracking dots
	 * @param {string} event The event name
	 * @param {function(evt:Event)} func A function which is passed an Event object
	 */
	addEventListener(event, func) {
		this.stripeElementHolder.addEventListener(event, func)
	}

	_onCenterItem(nextItemOriginalIndex, nextItemIndex) {

	}

	
	/**
	 * Animates the change of a property over a duration. Normally you might use
	 * css transition to do this, but there are some properties that doesn't work
	 * for (scroll positions).  
	 * 
	 * This method used a linear animation.
	 * 
	 * @param {Object} propertyHolder 
	 * @param {string} propertyName 
	 * @param {int} start 
	 * @param {int} end 
	 * @param {int} duration Time in milliseconds 
	 */
	animateProperty(propertyHolder, propertyName, start, end, duration) {
		this.animating = true
		let count = parseInt(duration / this.stepSize)
		let increment = (end - start) / count
		let accumulator = propertyHolder[propertyName]
		let intervalTracker = setInterval(() => {
			count--
			accumulator += increment
			propertyHolder[propertyName] = accumulator


			if (count == 0) {
				clearInterval(intervalTracker)
				propertyHolder[propertyName] = end
				this.animating = false
				this.rebalance()
			}

		}, this.stepSize)
	}


	/**
	 * 
	 * @returns {int} The pixel with of all the items in the .mover
	 */
	_getItemsTotalWidth() {
		let totalItemWidths = 0
		let mover = this.mover
		for (let el of mover.children) {
			totalItemWidths += el.offsetWidth
		}
		return totalItemWidths
	}

	/**
	 * Resizes the .mover element so that it comfortably holds all of the items.
	 * This is something you'd think should work out naturally with various css
	 * styling, but it didn't. It would be a nice future improvment to style the
	 * .mover so that this method is no longer needed.
	 */
	_resizeMover() {
		let totalItemWidths = this._getItemsTotalWidth()
		this.mover.style.width = ((this.sidePadding * 2) + totalItemWidths) + 'px'
	}

	/**
	 * Centers the item to the right of the currently centered item.
	 * This movement is performed with an animation.
	 */
	centerItemToRight() {
		let centered = this.getCenterItem()
		if (centered) {
			this.center(centered.ind + 1, true)
		}
		else {
			this.center(null, true)
		}
		this.rebalance()
	}

	/**
	 * Centers the item to the left of the currently centered item.
	 * This movement is performed with an animation
	 */
	centerItemToLeft() {
		let centered = this.getCenterItem()
		if (centered) {
			let next = centered.ind - 1
			if (next < 0) {
				next = 0
			}
			this.center(next, true)
		}
		else {
			this.center(null, true)
		}
		this.rebalance()
	}

	/**
	 * Centers the elements in the frame, optionally on a specific element
	 * 
	 * Calling this method with a specific item causes a 'center' event to be dispatched.
	 * 
	 * @param {null,int} [item] - an optional element that specifies what should be centered
	 * @param {boolean} [animate] If true, the centering will be done as a slide animation. If false
	 * or undefined no animation will take place.
	 */
	center(item, animate) {
		this._resizeMover()
		let se = this.stripeElement;
		let stripeWidth = se.offsetWidth
		let mover = this.mover

		if (!item) {
			let itemWidth = this._getItemsTotalWidth()
			let additionalOffset = (itemWidth - stripeWidth) / 2
			if (animate) {
				this.animateProperty(se, 'scrollLeft', se.scrollLeft, this.sidePadding + additionalOffset, this.animationDuration)
			}
			else {
				se.scrollLeft = this.sidePadding + (additionalOffset)
			}
		}
		if (Number.isInteger(item)) {
			let child = mover.children[item]
			if (!child) {
				return
			}
			let childWidth = child.offsetWidth
			let childLeft = child.offsetLeft
			let childCenter = childLeft + (childWidth / 2)

			if (animate) {
				this.animateProperty(se, 'scrollLeft', se.scrollLeft, childCenter - (stripeWidth / 2), this.animationDuration)
			}
			else {
				se.scrollLeft = childCenter - (stripeWidth / 2)
			}

			let evt = new Event('center')
			evt.nextItemOriginalIndex = parseInt(child.getAttribute(positionAttributeName))
			evt.nextItemIndex = item
			this.stripeElementHolder.dispatchEvent(evt)
		}
	}

	/**
	 * Returns the item currently under the center line of the .circular-stripe element.
	 * @returns {{ind: int, item: Element}} Returns the index and element item which is currently 
	 * centered. If no item is centered, returns null.
	 */
	getCenterItem() {
		this._resizeMover()
		let se = this.stripeElement;
		let stripeWidth = se.offsetWidth

		let centerPosition = se.scrollLeft + (stripeWidth / 2)

		let count = 0
		for (let el of this.mover.children) {
			let childOffset = el.offsetLeft
			let childWidth = el.offsetWidth
			if (childOffset <= centerPosition && (childOffset + childWidth) >= centerPosition) {
				return {
					ind: count,
					item: el
				}
			}
			count++
		}
	}

	/**
	 * Calculates a numeric measure of balance by incrementing 
	 * for every item to the right of the center item and
	 * decrementing for every item to the left.
	 * 
	 * A balance of 1 would indicate there are one more items
	 * to the right than to the left of the centered item.
	 * 
	 * A balance of -2 would indicate two more to the left than
	 * to the right
	 * @returns {int} The balance
	 */
	_getBalance() {
		this._resizeMover()
		let se = this.stripeElement;
		let stripeWidth = se.offsetWidth

		let leftPosition = se.scrollLeft
		let rightPosition = se.scrollLeft + stripeWidth
		let balance = 0

		for (let el of this.mover.children) {
			let childOffset = el.offsetLeft
			let childWidth = el.offsetWidth

			if ((childOffset + childWidth) < leftPosition) {
				balance--
			}
			if (childOffset > rightPosition) {
				balance++
			}
		}
		return balance
	}

	/**
	 * Rebalances the stripe so roughly as many items are to the 
	 * right of the center item as are to the left of the center
	 * item
	 */
	rebalance() {
		let trigger = 2
		let balance = this._getBalance()
		if (balance <= -1 * trigger) {
			let shift = 1 + Math.abs(balance) - trigger
			while (shift--) {
				this._moveFromLeftToRight()
			}
		}
		else if (balance >= trigger) {
			let shift = 1 + Math.abs(balance) - trigger
			while (shift--) {
				this._moveFromRightToLeft()
			}
		}
	}

	/**
	 * Moves one item from the right side of the stripe to the left
	 */
	_moveFromRightToLeft() {
		this._resizeMover()
		let se = this.stripeElement
		let mover = this.mover
		let nodeWidth = mover.lastElementChild.offsetWidth

		mover.insertBefore(mover.lastElementChild, mover.firstElementChild)
		se.scrollLeft += nodeWidth
	}

	/**
	 * Moves one item from the left side of the stripe to the right side
	 */
	_moveFromLeftToRight() {
		this._resizeMover()
		let se = this.stripeElement
		let mover = this.mover
		let nodeWidth = mover.firstElementChild.offsetWidth

		mover.lastElementChild.after(mover.firstElementChild)
		se.scrollLeft -= nodeWidth
	}


}

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



