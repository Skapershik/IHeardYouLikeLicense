function httpGet(url) {
    return new Promise(function (resolve, reject) {
        $.get({
            url: url,
            success: function (response) {
                resolve(response)
            },
            error: function () {
                reject('Error')
            }
        })
    })
}

function httpPost(url, data) {
    return new Promise(function (resolve, reject) {
        $.post({
            url: url,
            data: $.param(data),
            success: function (response) {
                resolve(response)
            },
            error: function () {
                reject('Error')
            }
        })

    })
}

function updatePageAction(tabId) {
    console.log('update page called!')
    chrome.tabs.sendMessage(tabId, {is_content_script: true}, function (response) {
        if (response.is_content_script) {
            //chrome.pageAction.show(tabId);
        }
    });
};

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    if (change.status == "complete") {
        updatePageAction(tabId);
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        request = JSON.parse(request)
        if (request.action !== undefined) {
            if (request['action'] === 'get') {
                httpGet(request['link']).then(
                    resolve => {
                        console.log('resolve:', resolve)
                        sendResponse(resolve)
                    },
                    reject => {
                        console.log('reject:', reject)
                        sendResponse(reject)
                    }
                )
            }
            else if (request['action'] === 'post') {
                httpPost(request['link'], request['data']).then(
                    resolve => {
                        console.log('resolve:', resolve)
                        sendResponse(resolve)
                    },
                    reject => {
                        console.log('reject:', reject)
                        sendResponse(reject)
                    }
                )
            }
        }
        return true;
    });
