(function(){
  var site;

  function setRadio(name, value) {
    var radio = document.querySelectorAll('input[name="' + name + '"][value="'+ value + '"]')[0];
    radio.checked = true;
  }

  function $(id){
    return document.getElementById(id);
  }

  function setVisibility(element, visible){
    element.style.visibility = visible? "visible": "hidden";
  }

  function markDefault() {
    var defaultChroma = chromaRepository.getDefault();
    var defaultRadio = $('chroma-' + defaultChroma);
    defaultRadio.parentNode.appendChild($('defaultMarker'));
  }

  function updateUseDefault(){
    var id = 'always-use-default-chroma',
      checkbox = $(id),
      label = document.querySelector('label[for="'+id+'"'),
      currentSiteChroma = chromaRepository.getForSite(site),
      defaultChroma = chromaRepository.getDefault(),
      visibility = !currentSiteChroma || currentSiteChroma === defaultChroma;

    setVisibility(checkbox, visibility);    
    setVisibility(label, visibility);
    checkbox.checked = !currentSiteChroma;
  }

  function updateDefault() {
    updateUseDefault();
    markDefault();
  }

  function update() {
    var currentSiteChroma, defaultChroma;
    if (site) {
      currentSiteChroma = chromaRepository.getForSite(site);
      defaultChroma = chromaRepository.getDefault();
      setVisibility($('make_default'), currentSiteChroma && currentSiteChroma !== defaultChroma);
      updateUseDefault();
    }
    chrome.extension.getBackgroundPage().updateTabs();
  }

  function onRadioChange(name, value) {
    chromaRepository.setForSite(site, value);
    update();
  }

  function onMakeDefault() {
    chromaRepository.setDefault(document.querySelector('input[name="chroma"]:checked').value);

    updateDefault();
    update();
  }

  function addRadioListeners(name) {
    var radios = document.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', function(evt) {
        onRadioChange(evt.target.name, evt.target.value);
      }, false);
    }
  }

  function init() {
    addRadioListeners('chroma');
    $('always-use-default-chroma').addEventListener('change', function (e) {
      if (e.target.checked) {
        chromaRepository.clearForSite(site);
      } else {
        chromaRepository.setForSite(site, chromaRepository.getDefault());
      }
    });
    chrome.windows.getLastFocused({'populate': true}, function(window) {
      site = 'unknown site';
      for (var i = 0; i < window.tabs.length; i++) {
        var tab = window.tabs[i];
        if (tab.active) {
          tabUrl = tab.url;
          site = siteFromUrl(tabUrl);
          $('site').innerHTML = site;
          $('make_default').style.display = 'block';
          break;
        }
      }

      var chroma = chromaRepository.getForSite(site) || chromaRepository.getDefault();
      setRadio('chroma', chroma);

      updateDefault();

      update();
    });
    $('make_default').addEventListener('click', onMakeDefault, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    init();
  });
})();