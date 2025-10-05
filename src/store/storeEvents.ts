// 스토어 간 이벤트 전달을 위한 간단한 이벤트 시스템
type StoreEventHandler<T = unknown> = (payload: T) => void;

export const storeEvents = {
  subscribers: new Map<string, StoreEventHandler[]>(),

  emit<T = unknown>(event: string, payload: T) {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      handlers.forEach(handler => (handler as StoreEventHandler<T>)(payload));
    }
  },

  subscribe<T = unknown>(event: string, handler: StoreEventHandler<T>) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)?.push(handler as StoreEventHandler);

    return () => {
      const handlers = this.subscribers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler as StoreEventHandler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }
};