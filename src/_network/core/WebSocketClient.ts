import ReconnectingWebSocket from "reconnecting-websocket";

export interface WebSocketMessage<T> {
  type: string;
  payload: T;
}

export class WebSocketClient<T> {
  private socket?: ReconnectingWebSocket;

  connect(url: string, onMessage: (data: T) => void) {
    this.socket = new ReconnectingWebSocket(url);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
  }

  send(payload: unknown) {
    this.socket?.send(JSON.stringify(payload));
  }

  disconnect() {
    this.socket?.close();
  }
}
