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

// TODO: make it work!
/*function block_sa() {
    // modifed, original https://github.com/Gjmrd/saab/blob/master/sa-adblocker.user.js

    var script = document.createElement('script');
    script.innerHTML = `
        var watchedVideoToday = getCookieItem("watchedVideoToday");
        var lastDate          = getCookieItem("lastDate");
        var dateTime          = new Date()
        var today             = dateTime.getDate();
        var now              = dateTime.getTime();
        if ((isNaN(watchedVideoToday)) || (today != lastDate)){
            watchedVideoToday = 1;
            lastDate = today;
        }
        var expireTime = (new Date()).setTime(now + (1000 * 60 * 60));
        setCookieItem('watchedVideoToday', +watchedVideoToday+1, '/');
        setCookieItem('watchedPromoVideo', now, expireTime, '/');
        setCookieItem('lastDate', lastDate, '/');
    `;
    script.setAttribute('id', 'super_id_name');
    document.body.appendChild(script);
} */

function block_sa(tab_id) {
    chrome.tabs.get(tab_id, function(tab) {
        chrome.cookies.get({url: tab.url, name: 'watchedVideoToday'}, function(watchedVideoToday) {
            if(watchedVideoToday) {
                watchedVideoToday = watchedVideoToday.value
            }
            chrome.cookies.get({url: tab.url, name: 'lastDate'}, function(lastDate) {
                if(lastDate) {
                    lastDate = lastDate.value
                }
                let dateTime = new Date()
                let today = dateTime.getDate();
                let now = dateTime.getTime();
                if ((isNaN(watchedVideoToday)) || (today != lastDate)){
                    watchedVideoToday = 1;
                    lastDate = today;
                }
                var expireTime = (new Date()).setTime(now + (1000 * 60 * 60));

                chrome.cookies.set({url: tab.url, name: 'watchedVideoToday', value: (watchedVideoToday+1).toString(), path: '/'}, function() {});
                chrome.cookies.set({url: tab.url, name: 'watchedPromoVideo', value: now.toString(), expirationDate: expireTime, path: '/'}, function() {});
                chrome.cookies.set({url: tab.url, name: 'lastDate', value: lastDate.toString(), path: '/'}, function() {});
                console.log('sa blocked')
            })
        })
    })
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
        try {
            block_sa(tabId)
        }
        catch(err) {
            console.log('block sa failed!')
            console.log(err)
        }
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
