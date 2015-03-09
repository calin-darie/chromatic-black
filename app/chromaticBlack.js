(function () {
  var lightness = 0;

  function onExtensionMessage(request) {
    var isNestedDocument = (window != window.top);
    if (!request) return;
    var chroma = request.chroma;
    if (!isNestedDocument && lightness > 128) {
      chroma = 'original-background-and-colors';
    }
    document.documentElement.setAttribute('chroma', chroma);
    if (isNestedDocument) {
      document.documentElement.setAttribute('nested-document', 'true');
    }
  }

  chrome.extension.onRequest.addListener(onExtensionMessage);
  function init() {
    chrome.extension.sendRequest({
      'init': true
    }, onExtensionMessage);
  }

  init();

  document.addEventListener("DOMContentLoaded", function (event) {
    function getAverageTextColor() {
      var color, average = { red: 0, green: 0, blue: 0 }, incrementRed, incrementGreen, incrementBlue;
      var node, clientRects, iChild, rect, weight, colorScanNode,
        totalWeight = 0,
        walk = document.createTreeWalker(document, NodeFilter.SHOW_TEXT, null, false),
        scaledArea = function (rect) {
          if (!rect) return 0;
          var scale = 200;
          return rect.width / scale * rect.height / scale;
        };
      while (node = walk.nextNode()) {
        clientRects = node.parentElement.getBoundingClientRect();
        weight = scaledArea(rect);
        for (iChild = 0; iChild < node.parentElement.children.length; iChild++) {
          rect = node.parentElement.children[iChild].getBoundingClientRect();
          weight -= scaledArea(rect);
        }
        if (weight <= 0) continue;
        color = (window.getComputedStyle(node.parentElement).color).match(/\d+/g);
        incrementRed = parseInt(color[0]);
        incrementGreen = parseInt(color[1]);
        incrementBlue = parseInt(color[2]);
        average.red += incrementRed * weight;
        average.blue += incrementBlue * weight;
        average.green += incrementGreen * weight;
        var max = Math.max(incrementRed, incrementGreen, incrementBlue);
        totalWeight += weight;
      }
      average.red /= totalWeight; average.blue /= totalWeight; average.green /= totalWeight;
      return average;
    };

    var averageTextColor = getAverageTextColor();
    var max = Math.max(averageTextColor.red, averageTextColor.green, averageTextColor.blue),
        min = Math.min(averageTextColor.red, averageTextColor.green, averageTextColor.blue);
    lightness = (max + min) / 2;

    init();
  });
})();