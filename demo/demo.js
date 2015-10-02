if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(function(registration) {
    console.log('service worker registered');
  });
}

function sendRegister(endpoint, key) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();

    request.open('POST', 'https://127.0.0.1:50005');
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(JSON.stringify({
      endpoint: endpoint,
      key: btoa(String.fromCharCode.apply(null, new Uint8Array(key))),
    }));

    request.onload = resolve;
    request.onerror = reject;
  });
}

navigator.serviceWorker.ready.then(function(reg) {
  var channel = new MessageChannel();
  channel.port1.onmessage = function(e) {
    window.document.title = e.data;
  }
  reg.active.postMessage('setup', [channel.port2]);

  return reg.pushManager.getSubscription().then(function(subscription) {
    if (!subscription) {
      return reg.pushManager.subscribe({ userVisibleOnly: true }).then(function(subscription) {
        return subscription;
      });
    } else {
      return subscription;
    }
  });
}).then(function(subscription) {
  sendRegister(subscription.endpoint, subscription.getKey('p256dh'));
});
