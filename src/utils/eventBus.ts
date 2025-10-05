type EventCallback<T = unknown> = (payload: T) => void;

class EventBus {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  on<T = unknown>(event: string, callback: EventCallback<T>) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback as EventCallback);
    // 구독 해제 함수 반환
    return () => {
      this.off(event, callback as EventCallback);
    };
  }

  off<T = unknown>(event: string, callback: EventCallback<T>) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback as EventCallback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  emit<T = unknown>(event: string, payload: T) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach(callback => (callback as EventCallback<T>)(payload));
  }
}

export const eventBus = new EventBus();