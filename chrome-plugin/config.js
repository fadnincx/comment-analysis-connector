/**
 * SCG Comment Analysis Connector Plugin
 * Author: Marcel Würsten
 *
 * This file is part of the plugin configuration page
 */

// get the configuration elements
const changeEnable = document.getElementById('changeEnable')
const apiAddress = document.getElementById('apiAddress')


//on init update the UI based on stored values
chrome.storage.sync.get(['enable', 'apiAddress'], function(data) {
  changeEnable.checked = data.enable
  apiAddress.value = data.apiAddress
});

// When the address changes, store this value
apiAddress.onchange = function (element) {
  let address = this.value;

  //update the extension storage value
  chrome.storage.sync.set({'apiAddress': address}, function() {
    console.log('The api address is'+ address);
  });

}

// When the enable checkbox changes, store this change and send notification to tabs to adjust for changed settings
changeEnable.onchange = function(element) {
  let enabled = this.checked;

  //update the extension storage value
  chrome.storage.sync.set({'enable': enabled}, function() {
    console.log('The value is'+ enabled);
  });

  //Pass init or remove message to content script 
  if(enabled){
    chrome.tabs.query({}, (tabs) => tabs.forEach( tab => chrome.tabs.sendMessage(tab.id, 'init') ) );
  }else{
    chrome.tabs.query({}, (tabs) => tabs.forEach( tab => chrome.tabs.sendMessage(tab.id, 'remove') ) );
  }

};