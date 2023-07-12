import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type MessageType =
  | 'error'
  | 'connect'
  | 'connect-accept'
  | 'student-connect'
  | 'student-disconnect'
  | 'start-game'
  | 'game-started'
  | 'final-results'
  | 'next-prompt'
  | 'server-next-prompt'
  | 'server-next-choices'
  | 'server-next-results'
  | 'next-choices'
  | 'next-results'
  | 'submit-choice'
  | 'choice-result';

export type ConnectPayload = {
  token: string;
  joinCode?: string;
  quizId?: number;
};

export interface SocketListener {
  onMessage: (e_type: MessageType, payload: any) => void;
  onError: (error: string) => void;
  onClosed: () => void;
}

export type CreateSocketConfig = {
  connectPayload: ConnectPayload;
  listener: SocketListener;
};

export type CreatedSocket = {
  socket: WebSocket;
  close: () => void;
  sendJson: (m_type: MessageType, payload: any) => void;
};

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: WebSocket | null = null;

  createSocket(config: CreateSocketConfig): Observable<any> {
    const subject = new Subject<any>();

    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/quiz/`);

    this.socket.onmessage = (msg) => {
      const message = JSON.parse(msg.data);

      if (message.type === 'error') {
        config.listener.onError(message.payload);
      } else {
        config.listener.onMessage(message.type, message.payload);
      }

      subject.next(message);
    };

    this.socket.onclose = () => {
      config.listener.onClosed();
    };

    this.socket.onopen = () => {
      this.sendJson('connect', config.connectPayload);
    };

    return subject.asObservable();
  }

  public sendJson(m_type: MessageType, payload: any) {
    if (this.socket) {
      this.socket.send(JSON.stringify({ type: m_type, payload: payload }));
    }
  }

  closeSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
