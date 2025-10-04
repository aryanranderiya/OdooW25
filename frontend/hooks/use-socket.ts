import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      console.log("⚠️  No userId provided, skipping WebSocket connection");
      return;
    }

    console.log(`🔌 Attempting to connect WebSocket for user: ${userId}`);
    console.log(`   Socket URL: ${SOCKET_URL}`);

    socketRef.current = io(SOCKET_URL, {
      auth: {
        userId,
      },
      query: {
        userId,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ WebSocket connected successfully");
      console.log(`   Socket ID: ${socketRef.current?.id}`);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("⚠️  WebSocket connection error:", error.message);
      console.error("   Details:", error);
    });

    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting WebSocket");
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
}
