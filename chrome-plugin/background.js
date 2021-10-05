chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({enabled: true}, function() {
      console.log("Code Comment Analysis is enabled");
    });
    chrome.storage.sync.set({apiAddress: '127.0.0.1:8080'}, function() {
        console.log("Api Server is set to 127.0.0.1:8080");
    });
  });