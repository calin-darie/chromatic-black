function init() {
  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      if (request['init']) {
        var chroma;
        if (sender.tab) {
          chroma = chromaRepository.getForSite(siteFromUrl(sender.tab.url));
        }
        chroma = chroma || chromaRepository.getDefault();
        var msg = {
          'chroma': chroma 
    	  };
        sendResponse(msg);
      }
    });
};

function updateTabs() {
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        var url = tabs[j].url;
        var msg = {
          'chroma': chromaRepository.getForSite(siteFromUrl(url))
            || chromaRepository.getDefault()
        };
        chrome.tabs.sendRequest(tabs[j].id, msg);
      }
    }
  });
};

init();
