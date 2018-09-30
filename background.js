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
    chrome.tabs.get(tab_id, function (tab) {
        chrome.cookies.get({url: tab.url, name: 'watchedVideoToday'}, function (watchedVideoToday) {
            if (watchedVideoToday) {
                watchedVideoToday = watchedVideoToday.value
            }
            chrome.cookies.get({url: tab.url, name: 'lastDate'}, function (lastDate) {
                if (lastDate) {
                    lastDate = lastDate.value
                }
                let dateTime = new Date()
                let today = dateTime.getDate();
                let now = dateTime.getTime();
                if ((isNaN(watchedVideoToday)) || (today != lastDate)) {
                    watchedVideoToday = 1;
                    lastDate = today;
                }
                var expireTime = (new Date()).setTime(now + (1000 * 60 * 60));

                chrome.cookies.set({
                    url: tab.url,
                    name: 'watchedVideoToday',
                    value: (watchedVideoToday + 1).toString(),
                    path: '/'
                }, function () {
                });
                chrome.cookies.set({
                    url: tab.url,
                    name: 'watchedPromoVideo',
                    value: now.toString(),
                    expirationDate: expireTime,
                    path: '/'
                }, function () {
                });
                chrome.cookies.set({
                    url: tab.url,
                    name: 'lastDate',
                    value: lastDate.toString(),
                    path: '/'
                }, function () {
                });
                console.log('sa blocked')
            })
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
        try {
            block_sa(tabId)
        }
        catch (err) {
            console.log('block sa failed!')
            console.log(err)
        }
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
