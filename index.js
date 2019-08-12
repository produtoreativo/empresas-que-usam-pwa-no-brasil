const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const site = process.argv[2];


function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      return chrome.kill().then(() => results.lhr)
    });
  });
}

const opts = {
  quiet: true,
  output: 'json',
  onlyCategories: ['pwa'],
  chromeFlags: ['--headless']
};


launchChromeAndRunLighthouse(site, opts).then(results => {
  const refs =  results.categories.pwa.auditRefs.reduce((list, b) => { list[b.id]=b.weight; return list; }, {});
  console.log(`${site}, score: ${results.categories.pwa.score}`);
  for(metric in results.audits) {
    const item = results.audits[metric];
    console.log(`${item.id}:${item.score}, weight(${refs[item.id]}), ${ item.score * refs[item.id]}`);
  }

});
