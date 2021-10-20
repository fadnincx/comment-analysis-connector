// noinspection CssUnresolvedCustomProperty

/**
 * Global variables
 */
let charCount2Line = [0];

/**
 * Enable/Disable marking in the corner
 */
const enableCornerMarking = function(color){
	if( document.getElementById( 'cornerMarkingDiv' ) == null ){
		const cornerMarking = document.createElement("div");
		cornerMarking.id = "cornerMarkingDiv";
		cornerMarking.style.width = '0px';
		cornerMarking.style.height = '0px';
		cornerMarking.style.borderStyle = 'solid';
		cornerMarking.style.borderWidth = '0 30px 30px 0';
		cornerMarking.style.borderColor = 'transparent '+color+' transparent transparent';
		cornerMarking.style.position = 'fixed';
		cornerMarking.style.right = '0px';
		cornerMarking.style.top = '0px';
		document.body.appendChild(cornerMarking);
	}else{
		const cornerMarking = document.getElementById("cornerMarkingDiv")
		cornerMarking.style.borderColor = 'transparent '+color+' transparent transparent';
	}
}
const disableCornerMarking = function(){
	if( document.getElementById( 'cornerMarkingDiv' ) != null ){
	    document.getElementById( 'cornerMarkingDiv' ).parentElement.removeChild( document.getElementById( 'cornerMarkingDiv' ) );
	}
}

/**
 * Add Tooltip to dom element
 */
const addTooltip = function(el, msg){
	// Mark element
	el.style.textDecorationLine = 'underline';
	el.style.textDecorationColor = 'green';
	// Seems buggy: https://bugs.chromium.org/p/chromium/issues/detail?id=668042
	// el.style.textDecorationStyle = 'wavy';
	
	const tooltipId = Math.random().toString(36).substring(2,34);
	el.addEventListener("mouseover", function( event ) {
		const tooltip = document.createElement("div");
		tooltip.id = tooltipId;
		tooltip.style.paddingLeft = '5px';
		tooltip.style.paddingRight = '5px';
		tooltip.style.border = 'solid 1px pink';
		tooltip.style.background = '#ffffff';
		tooltip.style.color = '#000000';
		tooltip.style.zIndex = '9999';
		tooltip.style.position = 'absolute';
		tooltip.style.top = '40px';
		tooltip.style.left = '20px';
		tooltip.innerHTML = msg;
		event.target.appendChild(tooltip);
	}, false);
	el.addEventListener("mouseout", function( event ) {
		if( document.getElementById( tooltipId ) != null ){
	    document.getElementById( tooltipId ).parentElement.removeChild( document.getElementById( tooltipId ) );
	}
	}, false);
	
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

	return url;
};

/**
 * Return the table element containing the source code
 */
const getCodeTable = function(){
	return document.querySelectorAll("table.js-file-line-container")[0];
}

/**
 * Wraps a text node into a span element node
 */
const wrapTextNode = function(txtNode){
	if(txtNode.nodeType !== Node.TEXT_NODE){
		return txtNode;
	}
	const wrapper = document.createElement('span')
	wrapper.style.whiteSpace = 'pre'
	txtNode.parentElement.replaceChild(wrapper,txtNode)
	wrapper.appendChild(txtNode)
	return wrapper
}

/**
 * Returns the source code / filepath as string
 */
const getSourceFile = function (){
	const table = getCodeTable();
	if(table == null){
		console.log("No code found!");
		return '';
	}
	let file = "";
	let totalChars = 0;
	for(let i in table.rows){
		charCount2Line[i] = totalChars;
		let row = table.rows[i];
		for(let j in row.cells){
			let cell = row.cells[j];
			for(k in cell.childNodes){
				let child = cell.childNodes[k];
				if(child.nodeType === Node.TEXT_NODE){
					child = wrapTextNode(child)
				}
				if(child.textContent != null){
					totalChars += child.textContent.length;
					file += child.textContent;
				}else if (child.innerHTML != null){
					totalChars += child.innerHTML.length;
					file += child.innerHTML;
				}
			}
		}
		file += "\n";
	}
	charCount2Line = charCount2Line.filter((x) =>  x != null)
	return file;
}
const getFilePath = function (){
	let el = document.querySelectorAll("h2#blob-path")
	return el[0].innerText.replace(' / Jump to ','')
}

/**
 * Splits a span element into a new element at given index
 * @return the new element
 */
const splitElement = function (el, index){
	if(el.tagName == null){
		el = wrapTextNode(el)
	}

	// Create new DOM Element
	const newElement = document.createElement('span')
	// Copy classes from origin
	newElement.classList = el.classList
	newElement.innerHTML = el.innerHTML.substring(index)
	el.innerHTML = el.innerHTML.substr(0, index)
	el.after(newElement)
	return newElement
}

/**
 * Adding attribute with id to exactly the part that needs it
 */
const setAttributeForRange = function (id, from, to){

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
					break;
				}

				let child = cell.childNodes[j]

				// Get the text length of this child
				let txtLength = 0;
				if(child.textContent != null){
					txtLength = child.textContent.length;
					//console.log("'"+child.textContent+"' has length "+txtLength)
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
					startChar -= txtLength;

				// If range starts at the first character and range is longer than the text length, include whole child
				}else if(startChar === 0 && neededChars >= txtLength){
					child.setAttribute('commentAnalysisId',id)
					neededChars -= txtLength;
					startChar = 0

				// if range starts at first character and ands within this child, split it up and include first part
				}else if(startChar === 0){
					splitElement(child, neededChars);
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
					const el = splitElement(child, startChar);
					splitElement(el, neededChars);
					el.setAttribute('commentAnalysisId',id)
					neededChars = 0
				}
			}
			// If no further chars needed for the range, brake the loop, no unnecessary loop through cells
			if (neededChars === 0) {
				break;
			}
		}
	}
}

const groupBy = function (list, keyGetter){
	const map = new Map()
	list.forEach(item => {
		const key = keyGetter(item)
		key.forEach( k => {
			const collection = map.get(k)
			collection?collection.push(item.id):map.set(k, [item.id])
		})
	})
	return map
}

const movableElement = function(el){

	const wrapper = document.createElement('div')
	el.parentElement.replaceChild(wrapper,el)
	wrapper.appendChild(el)

	wrapper.style.touchAction = 'none'
	el.style.touchAction = 'none'
	el.style.userSelect = 'none'
	wrapper.style.cursor = 'pointer'

	let active = false
	let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

	const dragStart = function(e){
		if (e.type === "touchstart") {
			initialX = e.touches[0].clientX - xOffset;
			initialY = e.touches[0].clientY - yOffset;
		} else {
			initialX = e.clientX - xOffset;
			initialY = e.clientY - yOffset;
		}

		if (e.target === el || e.target.parentElement === el) {
			active = true;
		}
	}
	const dragEnd = function(e){
		initialX = currentX;
		initialY = currentY;

		active = false;
	}
	const drag = function(e){
		if (active) {
			e.preventDefault();
			if (e.type === "touchmove") {
				currentX = e.touches[0].clientX - initialX;
				currentY = e.touches[0].clientY - initialY;
			} else {
				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;
			}
			xOffset = currentX;
			yOffset = currentY;
			el.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";
		}
	}

	wrapper.addEventListener("touchstart", dragStart, false);
	wrapper.addEventListener("touchend", dragEnd, false);
	wrapper.addEventListener("touchmove", drag, false);

	wrapper.addEventListener("mousedown", dragStart, false);
	wrapper.addEventListener("mouseup", dragEnd, false);
	wrapper.addEventListener("mousemove", drag, false);

}

const labelsList = function(labelMap) {
	if( document.getElementById( 'labelMapDiv' ) == null ){
		const labelMapDiv = document.createElement("div");
		labelMapDiv.id = "labelMapDiv";
		labelMapDiv.style.borderStyle = 'solid'
		labelMapDiv.style.borderWidth = '2'
		labelMapDiv.style.borderColor = 'green'
		labelMapDiv.style.position = 'fixed'
		labelMapDiv.style.right = '50px'
		labelMapDiv.style.top = '150px'
		labelMapDiv.style.backgroundColor = 'var(--color-canvas-default)'
		labelMapDiv.style.color = 'var(--color-fg-default);'
		labelMapDiv.style.padding = '20px'

		labelMapDiv.innerHTML = 'Labels<hr style="border: 1px solid var(--color-fg-default)">'
		labelMap.forEach((value, key) => {

			const labelEl = document.createElement("div")
			labelEl.innerHTML = key
			labelEl.style.paddingBottom = '5px'
			labelEl.addEventListener("mouseover", function (event) {
				value.forEach(id => {
					document.querySelectorAll('[commentAnalysisId="' + id + '"]').forEach(el => {
						el.style.backgroundColor = 'rgba(255,255,0,.5)'
					})
				})
			}, false)
			labelEl.addEventListener("mouseout", function (event) {
				value.forEach(id => {
					document.querySelectorAll('[commentAnalysisId="' + id + '"]').forEach(el => {
						el.style.backgroundColor = null
					})
				})
			}, false)
			labelMapDiv.appendChild(labelEl)
		})
		document.body.appendChild(labelMapDiv);
		movableElement(labelMapDiv)
	}else{
		console.warn('already has element #labelMapDiv')
	}
}


const applyResult = function (response){
	console.log("Respones is")
	console.log(response)
	response.forEach(range => {
		range.id =  Math.random().toString(36).substring(2,34);
		setAttributeForRange(range.id, range.from, range.to)

		document.querySelectorAll('[commentAnalysisId="'+range.id+'"]').forEach( el => {
			addTooltip(el, range.labels.join(', '))
		})

	})

	const labelMap = groupBy(response, range => range.labels)
	console.log(labelMap)
	labelsList(labelMap)

	enableCornerMarking('#00ff00');
}


/**
 * Enable/Disable main function
 */
var enable=function(){
	
	console.log("Enable start");
	enableCornerMarking('#ff0000');

	const srcFileContent = getSourceFile();
	if( srcFileContent.length <= 0 ) {
		console.log("No file content");
		return;
	}
	const srcFilePath = getFilePath();

	console.log(charCount2Line)

	// Read api address using the storage API
	chrome.storage.sync.get('apiAddress', function(data) {
		const address = getValidUrl(data.apiAddress);
		console.log(address)
		fetch(address + "analysis?filepath="+encodeURIComponent(srcFilePath), {
			method: 'POST',
			body: srcFileContent
		})
		.then(res => res.json())
		.then(res => {
			if(res.code === 0){
				applyResult(res.result)
			}else{
				console.error("Response code "+res.code)
				console.error(res.msg)
			}
		});
	});

	console.log("Enable done");
	
}
var disable=function(){
	
	console.log("Disable start");
	disableCornerMarking();
	console.log("Disable done");
	
}


//message listener for background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)    {
	console.log("Got message!")
    if(request.command === 'init'){
        enable();
    }else{
        disable();
    }
    sendResponse({result: "success"});
});


//on init perform based on chrome stroage value
window.onload=function(){  
    chrome.storage.sync.get('enable', function(data) {
        if(data.enable){
            enable();
        }else{
            disable();
        } 
    });
}