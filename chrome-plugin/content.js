/**
 * Enable/Disable marking in the corner
 */
const enableCornerMarking = function(){
	if( document.getElementById( 'cornerMarkingDiv' ) == null ){
		const cornerMarking = document.createElement("div");
		cornerMarking.id = "cornerMarkingDiv";
		cornerMarking.style.width = '0px';
		cornerMarking.style.height = '0px';
		cornerMarking.style.borderStyle = 'solid';
		cornerMarking.style.borderWidth = '0 30px 30px 0';
		cornerMarking.style.borderColor = 'transparent #ff0000 transparent transparent';
		cornerMarking.style.position = 'fixed';
		cornerMarking.style.right = '0px';
		cornerMarking.style.top = '0px';
		document.body.appendChild(cornerMarking);
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
	el.style.textDecorationStyle = 'wavy';
	
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

const getValidUrl = (url = "") => {

	if ( url.indexOf("http") < 0){
		url = 'http://'+url
	}
	if(!url.endsWith('/')){
		url = url + '/'
	}

	return url;
};

const getSourceFile = function (){
	let el = document.querySelectorAll("table.js-file-line-container");
	if (el.length < 1){
		console.log("No code found!");
		return '';
	}
	let table = el[0];
	let file = "";
	let totalChars = 0;
	for(let i in table.rows){
		let row = table.rows[i];
		for(let j in row.cells){
			let cell = row.cells[j];
			for(k in cell.childNodes){
				let child = cell.childNodes[k];
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
	return file;
}

const getFilePath = function (){
	let el = document.querySelectorAll("h2#blob-path")
	return el[0].innerText.replace(' / Jump to ','')
}

const applyResult = function (response){
	console.log("Respones is")
	console.log(response)
}


/**
 * Enable/Disable main function
 */
var enable=function(){
	
	console.log("Enable start");
	enableCornerMarking();

	const srcFileContent = getSourceFile();
	if( srcFileContent.length <= 0 ) {
		console.log("No file content");
		return;
	}
	const srcFilePath = getFilePath();

	// Read api address using the storage API
	chrome.storage.sync.get('apiAddress', function(data) {
		const address = getValidUrl(data.apiAddress);
		console.log(address)
		fetch(address + "analysis?filepath="+encodeURIComponent(srcFilePath), {
			method: 'POST',
			body: JSON.stringify(srcFileContent)
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

	// console.log(file);

	
	/*addTooltip(table.rows[5], 'This is row 6');
	addTooltip(table.rows[9], 'This is row 10');
	
	// GET Data from the API
	/*
	const response = {
		data: [
		{start: 60, length: 300, type: 'info'},
		{start: 400, length: 100, type: 'summary'}
		]
	}
	
	for (let i in response.data){
		
		let line = chars.length;
		for(; chars[line]>response.data[i].start; --line);
		let waitChars = response.data[i].start - chars[line];
		let charsNeeded = response.data[i].length;
		let row = table.rows[line];
		for(let j in row.cells){
			let cell = row.cells[j];
			for(k in cell.childNodes){
				let child = cell.childNodes[k];
				let txt = "";
				if(child.textContent != null){
					txt = child.textContent.length;
				}else if (child.innerHTML != null){
					txt = child.innerHTML.length;
				}
				if(waitChars > txt.length){
					waitChars -= txt.length;
				}else if (charsNeeded == 0){
					break;
				}else if(waitChars == 0 && txt.length<= charsNeeded){
					
				}
				
			}
		}
		
	}*/
	
	
	
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