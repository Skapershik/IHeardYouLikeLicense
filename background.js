function httpGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, false); // true for asynchronous
    xmlHttp.send(null);
}

function httpPost(url, data, callback) {
    var http = new XMLHttpRequest();
    var params = $.param(data)

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    }
    http.open('POST', url, false);
    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send(params);
}

function updatePageAction(tabId) {
    console.log('update page called!')
    chrome.tabs.sendMessage(tabId, {is_content_script: true}, function(response) {
        if(response.is_content_script) {
            //chrome.pageAction.show(tabId);
        }
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
                    console.log('data (get):', request['link'])
                    console.log('get resp:', data)
                    sendResponse(data)
                })
            }
            else if(request['action'] === 'post') {
                httpPost(request['link'], request['data'], function(data) {
                    console.log('data (post):', request['link'])
                    console.log('post resp:', data)
                    sendResponse(data)
                })
                //$.post(request['link'], request['data'], function(resp) {sendResponse(resp)})
            }
        }
  });
