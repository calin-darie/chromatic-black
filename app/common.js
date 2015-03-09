var chromaRepository = (function(){
  var FALLBACK_DEFAULT_SCHEME = chromas[0];

  function isValidChroma(chroma){
    return chromas.indexOf(chroma) != -1;
  }

  function getDefaultChroma() {
    var chroma = localStorage['defaultChroma'];
    if (!isValidChroma(chroma)) {
      chroma = FALLBACK_DEFAULT_SCHEME;
      setDefaultChroma(chroma);
    }
    return chroma;
  }

  function setDefaultChroma(chroma) {
    if (!isValidChroma(chroma)) {
      chroma = FALLBACK_DEFAULT_SCHEME;
    }
    localStorage['defaultChroma'] = chroma;
  }

  function getSiteChroma(site) {
    var siteChromas = tryLoadSiteChromas();
    var chroma = siteChromas[site];
    return isValidChroma(chroma) ? chroma : undefined;
  }
  function setSiteChroma(site, chroma) {
    var siteChromas = tryLoadSiteChromas();
    if (!isValidChroma(chroma)) {
      chroma = getDefaultChroma();
    }
    siteChromas[site] = chroma;
    saveSiteChromas(siteChromas);
  }

  function tryLoadSiteChromas(){
    var siteChromas;
    try {
      siteChromas = JSON.parse(localStorage['siteChromas']);
    } catch (e) {
      siteChromas = {};
    }
    return siteChromas;
  }

  function resetSiteChromas() {
    saveSiteChromas({});
  }

  function clearSiteChroma(site) {
    var chromas = tryLoadSiteChromas();
    delete chromas[site];
    saveSiteChromas(chromas);
  }

  function saveSiteChromas(siteChromas){
    localStorage['siteChromas'] = JSON.stringify(siteChromas);
  }

  return {
    getForSite: getSiteChroma,
    setForSite: setSiteChroma,
    clearForSite: clearSiteChroma,
    getDefault: getDefaultChroma,
    setDefault: setDefaultChroma
  };
})();

function siteFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname;
}