import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";

function UserDashboardLayout() {

  useEffect(() => {
    // Listen for foreground notifications while user is on dashboard
    const unsubscribe = onMessage(messaging, (payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/logo.png",
        });
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <>
      <UserNavbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default UserDashboardLayout;