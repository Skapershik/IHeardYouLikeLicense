function httpGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, false); // true for asynchronous
    xmlHttp.send(null);
}

function updatePageAction(tabId) {
    console.log('update page called!')
    chrome.tabs.sendRequest(tabId, {is_content_script: true}, function(response) {
        //if(response.is_content_script) {
            //chrome.pageAction.show(tabId);
        //}
    });
  };

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete") {
        updatePageAction(tabId);
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        request = JSON.parse(request)
        console.log('request:')
        console.log(request)
        if(request.action !== undefined) {
            if(request['action'] === 'get') {
                httpGet(request['link'], function(data) {
                    console.log('data:', request['link'])
                    console.log('sending resp:', data)
                    sendResponse(data)
                })
            }
            else if(request['action'] === 'post') {
                $.post(request['link'], request['data'])
                sendResponse('ok')
            }
        }
  });
