/* Fallbacks de librerías externas. Mantener versiones fijas para reproducibilidad. */
// Si el CDN principal falló, intentar alternativas
if(typeof XLSX==='undefined'){
  (function(){
    var cdns=[
      'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js'
    ];
    var i=0;
    function tryNext(){
      if(i>=cdns.length)return;
      var s=document.createElement('script');
      s.src=cdns[i++];
      s.onerror=tryNext;
      document.head.appendChild(s);
    }
    tryNext();
  })();
}

// Si el CDN principal falló, carga desde alternativas
(function(){
  if(typeof XLSX!=='undefined')return;
  var cdns=[
    'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
  ];
  function tryNext(i){
    if(i>=cdns.length)return;
    var s=document.createElement('script');
    s.src=cdns[i];
    s.onload=function(){window._xlsxReady=true;};
    s.onerror=function(){tryNext(i+1);};
    document.head.appendChild(s);
  }
  tryNext(0);
})();
