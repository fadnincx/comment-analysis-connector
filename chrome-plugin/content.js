// noinspection CssUnresolvedCustomProperty

/**
 * SCG Comment Analysis Connector Plugin
 * Author: Marcel Würsten
 *
 * This file is the main file, handling everything on github it self
 */

/**
 * Global variables
 */
let charCount2Line = [0]
// Styling and configuration
const labelAreaUnderlineColor = '#008000'
const tooltipBorder = 'solid 1px pink'
const tooltipBackgroundColor = '#ffffff'
const tooltipTextColor = '#000000'
const labelListBorder = 'solid 2px green'
const labelListBackgroundColor = 'var(--color-canvas-default)' // use variable from github
const labelListTextColor = 'var(--color-fg-default)'
const labelListHeaderSeparator = '1px solid var(--color-fg-default)'
const labelListHoverHighlight = 'rgba(255,255,0,.5)'
const cornerEnable = true
const cornerSuccessfulColor = '#00ff00'
const cornerNothingColor = '#0000ff'
const cornerApiFailed = '#ff0000'


/**
 * Set corner marking color with argument or give null to remove marking
 */
const cornerMarking = (color) => {

	// If corner is not enabled, return
	if(!cornerEnable){
		return;
	}

	// If no element exists, create element
	if( document.getElementById( 'cornerMarkingDiv' ) == null ){
		const cornerMarking = document.createElement("div")
		cornerMarking.id = "cornerMarkingDiv"
		cornerMarking.style.width = '0px'
		cornerMarking.style.height = '0px'
		cornerMarking.style.borderStyle = 'solid'
		cornerMarking.style.borderWidth = '0 30px 30px 0'
		cornerMarking.style.borderColor = 'transparent '+color+' transparent transparent'
		cornerMarking.style.position = 'fixed'
		cornerMarking.style.right = '0px'
		cornerMarking.style.top = '0px'
		document.body.appendChild(cornerMarking);

	// There exists an element
	}else{

		// if a color is given, adjust it
		if( color != null ) {
			document.getElementById("cornerMarkingDiv").style.borderColor = 'transparent ' + color + ' transparent transparent'

		// else remove the element
		}else {
			document.getElementById('cornerMarkingDiv').parentElement.removeChild(document.getElementById('cornerMarkingDiv'))

		}
	}
}

/**
 * Add Tooltip to dom element
 */
const addTooltip = (el, msg) => {
	// Mark element
	el.style.textDecorationLine = 'underline'
	el.style.textDecorationColor = labelAreaUnderlineColor
	// Seems buggy: https://bugs.chromium.org/p/chromium/issues/detail?id=668042
	// el.style.textDecorationStyle = 'wavy'
	
	const tooltipId = Math.random().toString(36).substring(2,34)
	el.addEventListener("mouseover", tooltipMouseOver.bind( {element:el, id:tooltipId, msg:msg} ) , false)
	el.addEventListener("mouseout",tooltipMouseOut.bind( {id:tooltipId} ), false)
	
}
/**
 * MouseOver Event for tooltip --> i.e. create tooltip
 */
const tooltipMouseOver = function ( event ) {
	const tooltip = document.createElement("div")
	tooltip.id = this.id
	tooltip.style.paddingLeft = '5px'
	tooltip.style.paddingRight = '5px'
	tooltip.style.border = tooltipBorder
	tooltip.style.background = tooltipBackgroundColor
	tooltip.style.color = tooltipTextColor
	tooltip.style.zIndex = '9999'
	tooltip.style.position = 'absolute'
	tooltip.style.top = '40px'
	tooltip.style.left = '20px'
	tooltip.innerHTML = this.msg
	this.element.appendChild(tooltip)
}
/**
 * MouseOut Event for tooltip --> i.e. destroy tooltip
 */
const tooltipMouseOut = function ( event ) {
	if( document.getElementById( this.id ) != null ){
		document.getElementById( this.id ).parentElement.removeChild( document.getElementById( this.id ) )
	}
}

/**
 * Remove Tooltip from dom element
 */
const removeTooltip = (el) => {
	el.style.textDecorationLine = null;
	el.removeEventListener("mouseover", tooltipMouseOver, false);
	el.removeEventListener("mouseout", tooltipMouseOut, false);
}

/**
 * Primitive check, if api url needs http prepended or / appended
 */
const getValidUrl = (url = "") => {

	if ( url.indexOf("http") < 0){
		url = 'http://'+url
	}
	if(!url.endsWith('/')){
		url = url + '/'
	}

	return url
}

/**
 * Return the table element containing the source code
 */
const getCodeTable = () => {
	return document.querySelectorAll("table.js-file-line-container")[0]
}

/**
 * Wraps a text node into a span element node
 */
const wrapTextNode = (txtNode) => {

	// If not a textnode, return node
	if(txtNode.nodeType !== Node.TEXT_NODE){
		return txtNode
	}

	// Create wrapper and style to show whitespaces
	const wrapper = document.createElement('span')
	wrapper.style.whiteSpace = 'pre'

	// Insert wrapper at position of node and add node as child of wrapper
	txtNode.parentElement.replaceChild(wrapper,txtNode)
	wrapper.appendChild(txtNode)
	return wrapper

}

/**
 * Returns the source code / filepath as string
 */
const getSourceFile = () => {

	// Get Codetable
	const table = getCodeTable()

	// If there is no such table, return empty string
	if(table == null){
		console.log("No code found!")
		return ''
	}

	// Init source code and length variable
	let src = "", totalChars = 0

	// Iterate over all rows in the table
	for(let i in table.rows){

		// Save current length as index for then faster processing afterwards
		charCount2Line[i] = totalChars

		// Iterate over the cells in a row
		let row = table.rows[i]
		for(let j in row.cells){

			// Iterate over nodes of a cell
			let cell = row.cells[j]
			for(let k in cell.childNodes){
				let child = cell.childNodes[k]

				// Precautionary wrap all direct text nodes
				if(child.nodeType === Node.TEXT_NODE){
					child = wrapTextNode(child)
				}

				// Get the text content from the node
				if(child.textContent != null){
					totalChars += child.textContent.length
					src += child.textContent
				}else if (child.innerHTML != null){
					totalChars += child.innerHTML.length
					src += child.innerHTML
					console.error("Used InnerHTML in source code scan!")
				}
			}
		}
		// Add new line to source string
		src += "\n"
	}
	// Reset array to only contain elements with content --> dynamic array resize doubles size and creates null elements
	charCount2Line = charCount2Line.filter((x) =>  x != null)

	return src

}
const getFilePath = () => {
	let el = document.querySelectorAll("h2#blob-path")
	return el[0].innerText.replace(' / Jump to ','')
}

/**
 * Splits a span element into a new element at given index
 * @return the new element
 */
const splitElement = (el, index) => {

	// If it's a text node, wrap it
	if(el.tagName == null){
		el = wrapTextNode(el)
	}

	// Create new DOM Element
	const newElement = document.createElement('span')

	// Copy classes from origin
	newElement.classList = el.classList

	// Set content of new element to 2nd part of original element
	newElement.innerHTML = el.innerHTML.substring(index)

	// Remove 2nd part of content in original element
	el.innerHTML = el.innerHTML.substr(0, index)

	// Add new element after original element
	el.after(newElement)

	// And return new element
	return newElement

}

/**
 * Adding attribute with id to exactly the part that needs it
 */
const setAttributeForRange = (id, from, to) => {

	// Get the line in which the given range starts
	let line = charCount2Line.filter((x) => x <= from).length - 1

	// Initialize how many chars need to be passed until range begins
	let startChar = from - charCount2Line[line]

	// initialize how many chars are still needed for the range
	let neededChars = to - from

	// if necessary do over multiple lines
	for(;neededChars>0&&getCodeTable().rows.length>line;++line){

		// Get the row and iterate over the cells
		const row = getCodeTable().rows[line]
		for(let i in row.cells){
			const cell = row.cells[i]

			// Iterate over all child elements of the cells
			for(let j in cell.childNodes){
				// If no further chars needed for the range, brake the loop
				if (neededChars === 0) {
					break
				}

				let child = cell.childNodes[j]

				// Get the text length of this child
				let txtLength = 0;
				if(child.textContent != null){
					txtLength = child.textContent.length
				}else if (child.innerHTML != null){
					txtLength = child.innerHTML.length;
					console.warn("Do inner HTML!")
				}
				// if there is no text, continue with next child
				if(txtLength <= 0){
					continue;
				}

				// if range starts after this child, just reduce startChar by the text length
				if(startChar > txtLength){
					startChar -= txtLength

				// If range starts at the first character and range is longer than the text length, include whole child
				}else if(startChar === 0 && neededChars >= txtLength){
					child.setAttribute('commentAnalysisId',id)
					neededChars -= txtLength
					startChar = 0

				// if range starts at first character and ands within this child, split it up and include first part
				}else if(startChar === 0){
					splitElement(child, neededChars)
					child.setAttribute('commentAnalysisId',id)
					neededChars = 0

				// if range doesn't start at first char but within this child, split it up and include second part
				}else if (startChar > 0 && neededChars > txtLength-startChar){
					const el = splitElement(child, startChar)
					el.setAttribute('commentAnalysisId',id)
					startChar = 0
					neededChars -= (txtLength - startChar)

				// Else means, the range starts and ends within this child. split it up twice and include only the middle part
				}else{
					const el = splitElement(child, startChar)
					splitElement(el, neededChars)
					el.setAttribute('commentAnalysisId',id)
					neededChars = 0
				}
			}
			// If no further chars needed for the range, brake the loop, no unnecessary loop through cells
			if (neededChars === 0) {
				break
			}
		}
	}
}

/**
 * Make given element movable
 */
const movableElement = function(el){

	// Wrap element to make this possible
	const wrapper = document.createElement('div')
	el.parentElement.replaceChild(wrapper,el)
	wrapper.appendChild(el)

	// define some basic styles for the element and wrapper
	wrapper.style.touchAction = 'none'
	el.style.touchAction = 'none'
	el.style.userSelect = 'none'
	wrapper.style.cursor = 'pointer'

	// Currently element is not moved
	let active = false

	// initialize coordinates variables
	let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0

	// define the drag start function
	const dragStart = (e) => {

		// Set initial coordinates
		if (e.type === "touchstart") {
			initialX = e.touches[0].clientX - xOffset
			initialY = e.touches[0].clientY - yOffset
		} else {
			initialX = e.clientX - xOffset
			initialY = e.clientY - yOffset
		}

		// Activate if drag started over element or it's parent
		if (e.target === el || e.target.parentElement === el) {
			active = true
		}

	}

	// define the drag end function
	const dragEnd = (e) => {

		// Save as new initial
		initialX = currentX;
		initialY = currentY;

		// set as not active
		active = false;

	}

	// define the drag function
	const drag = (e) => {

		// only do something if the drag is active
		if (active) {

			// Stop event propagation
			e.preventDefault();

			// Set new position
			if (e.type === "touchmove") {
				currentX = e.touches[0].clientX - initialX;
				currentY = e.touches[0].clientY - initialY;
			} else {
				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;
			}

			// Define new offset for next start
			xOffset = currentX;
			yOffset = currentY;

			// move element around
			el.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";

		}

	}

	// Add event listeners to the wrapper for touch and mouse
	wrapper.addEventListener("touchstart", dragStart, false);
	wrapper.addEventListener("touchend", dragEnd, false);
	wrapper.addEventListener("touchmove", drag, false);

	wrapper.addEventListener("mousedown", dragStart, false);
	wrapper.addEventListener("mouseup", dragEnd, false);
	wrapper.addEventListener("mousemove", drag, false);

}

/**
 * Create a list from a label map
 * @param labelMap
 */
const labelsList = (labelMap) => {

	// If list doesn't exist now create it
	if( document.getElementById( 'labelMapDiv' ) == null ){

		// Create element and apply some styles
		const labelMapDiv = document.createElement("div")
		labelMapDiv.id = "labelMapDiv"
		labelMapDiv.style.border = labelListBorder
		labelMapDiv.style.position = 'fixed'
		labelMapDiv.style.right = '50px'
		labelMapDiv.style.top = '150px'
		labelMapDiv.style.backgroundColor = labelListBackgroundColor
		labelMapDiv.style.color = labelListTextColor
		labelMapDiv.style.padding = '20px'

		// Insert List header
		labelMapDiv.innerHTML = 'Labels<hr style="border: ' + labelListHeaderSeparator + '">'

		// Iterate over the map
		labelMap.forEach((value, key) => {

			// Create an element for each label
			const labelEl = document.createElement("div")
			labelEl.innerHTML = key
			labelEl.style.paddingBottom = '5px'

			// Add listener on mouseOver highlight all segments
			labelEl.addEventListener("mouseover", (e) => {
				value.forEach(id => {
					document.querySelectorAll('[commentAnalysisId="' + id + '"]').forEach(el => {
						el.style.backgroundColor = labelListHoverHighlight
					})
				})
			}, false)

			// Add listener on mouseOut to unhighlight all segments
			labelEl.addEventListener("mouseout", function (event) {
				value.forEach(id => {
					document.querySelectorAll('[commentAnalysisId="' + id + '"]').forEach(el => {
						el.style.backgroundColor = null
					})
				})
			}, false)

			// Add label to labellist
			labelMapDiv.appendChild(labelEl)

		})

		// Add label list to DOM
		document.body.appendChild(labelMapDiv);

		// Make the label list movable
		movableElement(labelMapDiv)

	} else {
		console.warn('already has element #labelMapDiv')
	}
}

/**
 * Removes an element by it's id from the DOM
 */
const removeElementById = (elementId) => {
	if( document.getElementById( elementId ) != null ){
		document.getElementById( elementId ).parentElement.removeChild( document.getElementById( elementId ) );
	}
}

/**
 * Applies a successful response to the DOM
 * @param response
 */
const applyResponse = (response) => {

	// Create label map
	const labelMap = new Map()

	// Iterate over all ranges
	response.forEach(range => {

		// generate a unique id for each range
		range.id =  Math.random().toString(36).substring(2,34);

		// Set the attributes for this range
		setAttributeForRange(range.id, range.from, range.to)

		// Add a tooltip to all element with the attribute set
		document.querySelectorAll('[commentAnalysisId="'+range.id+'"]').forEach( el => {
			addTooltip(el, range.labels.join(', '))
		})

		// Add labels to label map
		range.labels.forEach(l => {
			const collection = labelMap.get(l)
			collection?collection.push(range.id):labelMap.set(l, [range.id])
		})

	})

	// Create label list
	labelsList(labelMap)

	// Mark corner as successful
	cornerMarking(cornerSuccessfulColor);

}


/**
 * Enable/Disable main function
 */
const enable = () => {
	
	// Set corner to nothing
	cornerMarking(cornerNothingColor);

	// Remove list if exists
	removeElementById('labelMapDiv')

	// Get source file
	const srcFileContent = getSourceFile();
	if( srcFileContent.length <= 0 ) {
		console.log("No file content");
		return;
	}
	const srcFilePath = getFilePath();

	// Read api address using the storage API
	chrome.storage.sync.get('apiAddress', function(data) {
		const address = getValidUrl(data.apiAddress);

		// Fetch result from api
		fetch(address + "analysis?filepath="+encodeURIComponent(srcFilePath), {
			method: 'POST',
			body: srcFileContent
		})
		// Turn json response string into object
		.then(res => res.json())
		// Handle successful response (2xx Status)
		.then(res => {
			// If code is 0 apply data
			if(res.code === 0){
				applyResponse(res.result)

			// Else display error
			}else{
				console.error("Response code "+res.code)
				console.error(res.msg)
			}
		// If there is an http error handle here
		}).catch(reason => {
			cornerMarking(cornerApiFailed)
			console.error(reason)
		});

	});
	
}
const disable = () => {

	// Remove label list
	removeElementById('labelMapDiv')

	// remove all tooltips
	document.querySelectorAll('[commentAnalysisId]').forEach( el => {
		removeTooltip(el)
	})

	// remove corner marking
	cornerMarking();

}

/**
 * Calls enable/disable based on current storage value
 */
const init = () => {
	chrome.storage.sync.get('enable', function(data) {
		if(data.enable){
			enable();
		}else{
			disable();
		}
	});
}

/**
 * Listener for messages from background task
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse)    {
		if(request === 'nav'){
			init()
		}else if(request === 'init'){
			enable()
		}else if(request === 'remove'){
			disable()
		}
		sendResponse({result: "success"});
	}
);

// On Load call init, because it might be not a history change
window.onload = init