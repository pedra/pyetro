//---------------------------------------------- CACHE --------------------------------
const CACHE = 'SALVA 0.0.7'
const FILES = [
    '/media/l.gif',
    '/media/2.jpg',
    '/media/3.jpg',
    '/media/4.jpg',
    '/media/5.jpg',
    '/media/6.jpg',
    '/media/7.jpg',
    '/media/8.jpg',
    '/media/9.jpg',
    '/media/10.jpg',
    '/media/11.jpg',
    '/media/12.jpg',
    '/media/13.jpg',
    '/media/14.jpg',
    '/media/15.jpg',
    '/media/16.jpg',
    '/media/17.jpg',
    '/media/18.jpg',
    '/media/19.jpg',
    '/media/20.jpg',
    '/media/21.jpg',

    '/favicon/favicon.ico',
    '/favicon/favicon-16x16.png',
    '/favicon/favicon-32x32.png',
    '/favicon/android-chrome-192x192.png',
    '/favicon/android-chrome-512x512.png',
    '/favicon/site.webmanifest',
    '/favicon.ico'
]

//---------------------------------------------- INSTALL  -----------------------------
self.addEventListener('install', function(e) 
{
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            //console.log('[SWORKER caching "' + CACHE + '"]')
            return cache.addAll(FILES)
        })
    )
})

//---------------------------------------------- ACTIVATE -----------------------------
self.addEventListener('activate', function(e) 
{
    e.waitUntil(
        caches.keys().then(function(keyList) 
        {
            return Promise.all(keyList.map(function(key) 
            {
                if (key !== CACHE) {
                    //console.log('[SWORKER removing "' + key + '" cache]');
                    return caches.delete(key);
                }
            }))
        })
    )
    return self.clients.claim()
});

//---------------------------------------------- FETCH   ------------------------------
self.addEventListener('fetch', function(e) 
{ 
    //console.log('[SWORKER fetch]', e.request.url)
    
    e.respondWith(
        caches.match(e.request).then(function(response) 
        {
            return response || fetch(e.request)
        })
    )
})



// --------- PUSH -------

self.addEventListener('push', function(event) {
    event.waitUntil(
        self.clients.matchAll().then(function(clientList) {

            //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`)

            var focused = clientList.some(function(client) {
                //console.log('[CLIENT]', client)
                client.postMessage({msg: event.data.json(), type: 'push'})
                return client.focused;
            })           

            var msg = {
                title: "error",
                body: "Ocorreu um erro no envio de notificação!"
            }
            try {
                msg = event.data.json()
            } catch (e){}

            // Para mudar o comportamento caso o FOCO do app esteja diferente: aberto (focado), fora de foco (mas, aberto) e fechado
            /*
            if (focused) {
                msg.body += 'You\'re still here, thanks!';
            } else if (clientList.length > 0) {
                msg.body += 'You haven\'t closed the page, click here to focus it!';
            } else {
                msg.body += 'You have closed the page, click here to re-open it!';
            } */          

            const title = msg.title
            const options = {
                body: msg.body || 'Você tem uma nova mensagem do SALVA!',
                icon: msg.icon || '/favicon/android-chrome-192x192.png',
                badge: msg.badge || '/favicon/favicon-32x32.png',
                image: msg.image || '/img/push.jpg',
                vibrate: msg.vibrate || [],
                data: JSON.parse("undefined" == typeof msg['data'] ? false : msg['data'])
            }

            return self.registration.showNotification(title, options)
        })
    )
})

// --------------------------- clicar em uma mensagem e abrir o aplicativo

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(
        self.clients.matchAll().then(function(clientList) {
            //console.log('[Service Worker] Notification click Received.', clientList, event.notification.data)

            var data = "undefined" !== typeof event.notification['data'] ? event.notification.data : {}

            event.notification.close()

            if (clientList.length > 0) {
                clientList[0].focus()
                return clientList[0].postMessage({msg: data, type: 'clientList[0]'})
            } else {
                self.clients.openWindow('/')
                .then(function(c){
                    //console.log('CLIENT OpenWindow: ', c)
                    return c
                }).then(function(a){
                        return a.postMessage({msg: data, type: 'clientList - clients - c'})
                    // })
                    // //if (c.length > 0) {
                    //     //console.log('Dentro de if: ', c[0])
                    //     c.focus()
                        
                    
                    // return c.postMessage({msg: data, type: 'clients'})
                })                
            }            
        })
    )
})