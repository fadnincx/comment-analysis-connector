const changeEnable = document.getElementById('changeEnable')
const apiAddress = document.getElementById('apiAddress')


//on init update the UI checkbox based on storage
chrome.storage.sync.get(['enable', 'apiAddress'], function(data) {
  changeEnable.checked = data.enable
  apiAddress.value = data.apiAddress
});

apiAddress.onchange = function (element) {
  let address = this.value;

  //update the extension storage value
  chrome.storage.sync.set({'apiAddress': address}, function() {
    console.log('The api address is'+ address);
  });

}
changeEnable.onchange = function(element) {
  let enabled = this.checked;

  //update the extension storage value
  chrome.storage.sync.set({'enable': enabled}, function() {
    console.log('The value is'+ enabled);
  });

  //Pass init or remove message to content script 
  if(enabled){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "init", enable: value}, function(response) {
        console.log(response.result);
      });
    });
  }else{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "remove", enable: value}, function(response) {
        console.log(response.result);
      });
    });
  }

};