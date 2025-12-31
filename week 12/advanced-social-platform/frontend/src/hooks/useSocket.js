import { useEffect, useState } from "react";
import io from "socket.io-client";

export const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId) {
      const s = io("http://localhost:5000");
      s.emit("join-user", userId);
      setSocket(s);
      return () => s.disconnect();
    }
  }, [userId]);

  return socket;
};
