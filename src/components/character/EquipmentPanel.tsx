import EquipmentSlot from './EquipmentSlot';
import { useGameStore } from '../../store/gameStore';

export const EquipmentPanel = () => {
  const equipment = useGameStore((state) => state.equipment);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">장비</h2>
      <div className="space-y-2">
        <EquipmentSlot slotType="weapon" item={equipment.weapon || undefined} />
        <EquipmentSlot slotType="armor" item={equipment.armor || undefined} />
        <EquipmentSlot slotType="accessory" item={equipment.accessory || undefined} />
      </div>
    </div>
  );
};