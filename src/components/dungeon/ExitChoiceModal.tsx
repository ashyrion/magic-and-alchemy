import React from 'react';
import { useDungeonStore } from '../../store/dungeonStore';

const ExitChoiceModal: React.FC = () => {
  const showExitChoice = useDungeonStore(state => state.showExitChoice);
  const currentLevel = useDungeonStore(state => state.currentLevel);
  const selectExitChoice = useDungeonStore(state => state.selectExitChoice);
  const hideExitChoiceModal = useDungeonStore(state => state.hideExitChoiceModal);

  if (!showExitChoice) return null;

  const handleNextLevel = () => {
    selectExitChoice('next');
  };

  const handleReturnToTown = () => {
    selectExitChoice('town');
  };

  const handleCancel = () => {
    hideExitChoiceModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">
            🚩 던전 출구
          </h2>
          <p className="text-gray-300 mb-4">
            {currentLevel}층을 클리어했습니다!
            <br />
            어디로 향하시겠습니까?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleNextLevel}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>⬇️</span>
            <span>{currentLevel + 1}층으로 진입</span>
            <span className="text-red-200 text-sm">(난이도 증가)</span>
          </button>

          <button
            onClick={handleReturnToTown}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>🏘️</span>
            <span>마을로 돌아가기</span>
            <span className="text-green-200 text-sm">(안전하게 휴식)</span>
          </button>

          <button
            onClick={handleCancel}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            취소 (계속 탐험)
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          💡 다음 층으로 갈수록 더 강한 적과 더 좋은 보상이 기다립니다
        </div>
      </div>
    </div>
  );
};

export default ExitChoiceModal;