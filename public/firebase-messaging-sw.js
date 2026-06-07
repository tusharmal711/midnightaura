importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyCbfFu9fwxThW_A0mN20XJHytUv0G5AbSM",
  authDomain:        "chomoktomok.firebaseapp.com",
  projectId:         "chomoktomok",
  storageBucket:     "chomoktomok.firebasestorage.app",
  messagingSenderId: "168896484730",
  appId:             "1:168896484730:web:a0ade0d11a0c9dda2572c3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/Images/chomoktomok-app.png",
  });
});