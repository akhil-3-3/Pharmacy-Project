import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

function SignalRWebSocket() {
  const [message, setMessage] = useState("");

  const connectionRef = useRef(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7232/chatHub")
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log("[Signal R] Connected");
      })
      .catch((err) => console.error(err));

    connection.on("ReceiveMessage", (message) => {
      console.log(message);
    });

    return () => {
      connection.stop();
    };
  }, []);

  const sendMessage = async () => {
    try {
      await connectionRef.current.invoke("SendMessage", message);
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default SignalRWebSocket;
