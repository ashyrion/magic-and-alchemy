import React from 'react';
import type { DungeonConfig } from '../../types/dungeon';

interface DungeonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDungeon: (config: DungeonConfig) => void;
}

const dungeonOptions: { name: string; description: string; config: DungeonConfig }[] = [
  {
    name: '초심자의 숲',
    description: '비교적 약한 몬스터들이 서식하는 숲입니다.',
    config: { roomsPerFloor: 5, type: 'forest', level: 1 },
  },
  {
    name: '오염된 동굴',
    description: '독과 함정으로 가득 찬 위험한 동굴입니다.',
    config: { roomsPerFloor: 8, type: 'cave', level: 3 },
  },
  {
    name: '잊혀진 폐허',
    description: '강력한 고대 몬스터들이 지키고 있는 유적입니다.',
    config: { roomsPerFloor: 10, type: 'ruins', level: 5 },
  },
];

export const DungeonSelectionModal: React.FC<DungeonSelectionModalProps> = ({ isOpen, onClose, onSelectDungeon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">던전 선택</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="space-y-4">
          {dungeonOptions.map((dungeon) => (
            <div key={dungeon.name} className="border border-gray-700 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <h3 className="text-xl font-semibold text-yellow-400">{dungeon.name}</h3>
              <p className="text-gray-300 my-2">{dungeon.description}</p>
              <button
                onClick={() => onSelectDungeon(dungeon.config)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                입장 (레벨 {dungeon.config.level})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
