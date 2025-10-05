import type { ReactNode } from 'react';
import { CharacterStatus } from '../character/CharacterStatus';
import { EquipmentPanel } from '../character/EquipmentPanel';
import { SkillPanel } from '../character/SkillPanel';
import { InventoryGrid } from '../inventory/InventoryGrid';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-4">
          {/* 왼쪽 사이드바 - 캐릭터 상태 */}
          <div className="col-span-3 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">캐릭터 정보</h2>
              <CharacterStatus />
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <EquipmentPanel />
            </div>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="col-span-6">
            <div className="bg-gray-800 rounded-lg p-4 min-h-[600px]">
              <div className="h-full">
                {children}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 - 인벤토리/스킬 */}
          <div className="col-span-3 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">인벤토리</h2>
              <InventoryGrid />
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <SkillPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLayout;