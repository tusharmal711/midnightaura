// src/hooks/useFCMToken.js
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";
import { API } from "../api";

const VAPID_KEY = "BHNa2kymQm9Gqeppv52AG9vRyZYYs5XxiJxsQx3kfrPzsYqUyvr9AhptExV59XpkAhK1nYlaP0pINs_FBLogACs";

export const useFCMToken = (isLoggedIn) => {
  useEffect(() => {
    // Only run if user is logged in
    if (!isLoggedIn) return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;

    const init = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token) return;

        await API.post("/user/saveFcmToken", { fcmToken: token });
        console.log("✅ FCM token saved");

        // Handle foreground notifications
        onMessage(messaging, (payload) => {
          if (Notification.permission === "granted") {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        });
      } catch (error) {
        console.warn("FCM init error:", error.message);
      }
    };

    init();
  }, [isLoggedIn]); // re-runs if login state changes
};