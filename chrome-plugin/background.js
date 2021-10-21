/**
 * SCG Comment Analysis Connector Plugin
 * Author: Marcel Würsten
 *
 * This file is the background service handler for everything that can not be done on the page
 */

/**
 * When installed, set the default values into the storage
 */
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({enabled: true}, function() {
      console.log("Code Comment Analysis is enabled");
    });
    chrome.storage.sync.set({apiAddress: '127.0.0.1:8080'}, function() {
        console.log("Api Server is set to 127.0.0.1:8080");
    });
  });

/**
 * When user navigates, alert content script, because Github is partially SPA, no onload event happens on some page change
 */
chrome.webNavigation['onHistoryStateUpdated'].addListener(function(details) {
    chrome.tabs.query({}, (tabs) => tabs.forEach( tab => chrome.tabs.sendMessage(tab.id, 'nav') ) );
})