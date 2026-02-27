import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';
import type { WsMessage } from '../api/ws';

export type ToastItem = {
  id: number;
  type: 'friend_invite' | 'game_invite' | 'game_invite_opponent_busy';
  username: string;
  matchId?: string;
  onAccept?: () => void;
  onCancel?: () => void;
};

function getWsBaseUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${proto}//${host}`;
}

type Listener = (msg: WsMessage) => void;

type RealtimeContextValue = {
  connection: {
    send: (payload: object) => void;
    isConnected: () => boolean;
  };
  subscribe: (listener: Listener) => () => void;
  isConnected: boolean;
  toast: ToastItem | null;
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  hideToast: () => void;
  addUnreadNotification: () => void;
  unreadCount: number;
  setUnreadCount: (n: number) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

let toastId = 0;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    const id = ++toastId;
    setToast({ ...item, id });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
      toastTimeoutRef.current = null;
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const addUnreadNotification = useCallback(() => {
    setUnreadCount((c) => c + 1);
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const send = useCallback((payload: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  const isConnectedFn = useCallback(
    () => wsRef.current != null && wsRef.current.readyState === WebSocket.OPEN,
    []
  );

  useEffect(() => {
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let cancelled = false;
    let ws: WebSocket | null = null;

    async function connect() {
      try {
        const { token } = await api.getWsToken();
        const base = getWsBaseUrl();
        const url = `${base}/ws?token=${encodeURIComponent(token)}`;
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!cancelled) setIsConnected(true);
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (!cancelled) setIsConnected(false);
        };

        ws.onerror = () => {
          if (!cancelled) setIsConnected(false);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as WsMessage;
            listenersRef.current.forEach((cb) => cb(msg));
          } catch {
            listenersRef.current.forEach((cb) =>
              cb({ type: 'error', code: 'parse_error', message: 'Invalid message' })
            );
          }
        };
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    }

    connect();
    return () => {
      cancelled = true;
      if (ws) {
        ws.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: RealtimeContextValue = {
    connection: { send, isConnected: isConnectedFn },
    subscribe,
    isConnected,
    toast,
    showToast,
    hideToast,
    addUnreadNotification,
    unreadCount,
    setUnreadCount,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}
