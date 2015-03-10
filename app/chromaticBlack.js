(function () {
  function init() {
    chrome.extension.sendRequest({
      'init': true
    }, onExtensionMessage);
  };

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
  };

  function getAverageTextColor() {
    function getScaledArea(element) {
      var rect, scale = 200;
      if (!element) return 0;
      rect = element.getBoundingClientRect();
      if (!rect) return 0;
      return rect.width / scale * rect.height / scale;
    };

    function getWeight(element) {
      var iChild;
      weight = getScaledArea(element);
      for (iChild = 0; iChild < element.children.length; iChild++) {
        weight -= getScaledArea(element.children[iChild]);
      }
    };

    var color,
      node, weight,
      totalWeight = 0,
      average = { red: 0, green: 0, blue: 0 }, red, green, blue,
      walk = document.createTreeWalker(document, NodeFilter.SHOW_TEXT, null, false);
    while (node = walk.nextNode()) {
      weight = getWeight(node.parentElement);
      if (weight <= 0) continue;
      color = (window.getComputedStyle(node.parentElement).color).match(/\d+/g);
      red = parseInt(color[0]);
      green = parseInt(color[1]);
      blue = parseInt(color[2]);
      average.red += red * weight;
      average.blue += blue * weight;
      average.green += green * weight;
      totalWeight += weight;
    }
    average.red /= totalWeight; average.blue /= totalWeight; average.green /= totalWeight;
    return average;
  };

  var lightness = 0;

  chrome.extension.onRequest.addListener(onExtensionMessage);

  init();

  document.addEventListener("DOMContentLoaded", function (event) {
    var averageTextColor = getAverageTextColor(),
      max = Math.max(averageTextColor.red, averageTextColor.green, averageTextColor.blue),
      min = Math.min(averageTextColor.red, averageTextColor.green, averageTextColor.blue);
    lightness = (max + min) / 2;

    init();
  });
})();