import type { Item } from '../../types/gameTypes';
import type { BattleLog } from '../../types/battle';

// 이벤트 타입 정의
export type EquipmentEvent = {
  type: 'equip' | 'unequip';
  item: Item;
};

// Store 이벤트 관련 타입 정의
export type StoreSubscriber = {
  addBattleLog: (message: string, type: BattleLog['type']) => void;
  isInBattle: () => boolean;
};

// 전역 스토어 이벤트 핸들러
export const globalStoreEvents = {
  battleSubscriber: null as StoreSubscriber | null,

  setBattleSubscriber(subscriber: StoreSubscriber) {
    this.battleSubscriber = subscriber;
  },

  addBattleLog(message: string, type: BattleLog['type']) {
    this.battleSubscriber?.addBattleLog(message, type);
  },

  isInBattle() {
    return this.battleSubscriber?.isInBattle() ?? false;
  },

  clearBattleSubscriber() {
    this.battleSubscriber = null;
  }
};