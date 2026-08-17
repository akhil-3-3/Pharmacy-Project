import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

function SignalRDemo() {
  const [message, setMessage] = useState("Waiting for notification...");

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7232/notificationHub") // Change your port
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (msg) => {
      console.log(msg);
      setMessage(msg);
      alert(msg);
    });

    connection
      .start()
      .then(() => console.log("✅ Connected to SignalR"))
      .catch((err) => console.error(err));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>SignalR Demo</h2>

      <h3>{message}</h3>
    </div>
  );
}

export default SignalRDemo;
