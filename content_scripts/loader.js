
!function() {
  var namespace = 'BulkXPLOR';
  
  var styles = [
    'web_resources/HangarXPLOR.Bulk.css',
   ];
  
  var scripts = [
      'web_resources/HangarXPLOR.BulkUI.js',

  ];
  
  var templates = [
    { id: 'tpl_reclaim_bulk', url: 'web_resources/HangarXPLOR.ReclaimBulk.html' },
    { id: 'tpl_gift_bulk', url: 'web_resources/HangarXPLOR.GiftBulk.html' }
  ];
  
  for (var i = 0, j = styles.length; i < j; i++) {
    var styleURL = chrome.runtime.getURL(styles[i]);
    console.log('Loading style', styleURL);
    var style = document.createElement('link');
    style.id = namespace + '-css-' + i;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = styleURL;
    document.body.appendChild(style);
  }
  
  for (var i = 0, j = scripts.length; i < j; i++) {
    var scriptURL = chrome.runtime.getURL(scripts[i]);
    console.log('Loading script', scriptURL);
    var script = document.createElement('script');
    script.id = namespace + '-js-' + i;
    script.type = 'text/javascript';
    script.src = scriptURL;
    document.body.appendChild(script);
  }
  
  for (var i = 0, j = templates.length; i < j; i++) {
    var templateURL = chrome.runtime.getURL(templates[i].url);
    console.log('Loading template', templateURL);
    var script = document.createElement('script');
    script.id = templates[i].id;
    script.type = 'text/x-jsmart-tmpl';
    script.src = templateURL;
    document.body.appendChild(script);
  }
}()
