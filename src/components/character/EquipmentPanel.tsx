import { EquipmentSlot } from './EquipmentSlot';

export const EquipmentPanel = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">장비</h2>
      <div className="space-y-2">
        <EquipmentSlot slot="weapon" label="무기" />
        <EquipmentSlot slot="armor" label="방어구" />
        <EquipmentSlot slot="accessory" label="장신구" />
      </div>
    </div>
  );
};