import React, { useState, useEffect } from 'react';
import type { ProcessingTask } from '../services/geminiService';
import { ClockIcon, BoltIcon, SparklesIcon, BuildingOffice2Icon, BookOpenIcon, DocumentPlusIcon, ClipboardDocumentIcon, UserCircleIcon, CameraIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface QueueViewProps {
  queue: ProcessingTask[];
  currentTaskProgress: { current: number; total: number } | null;
}

const modeDisplayInfo = {
    quality: { name: 'Chroma Scan', Icon: SparklesIcon, color: 'text-purple-500', borderColor: 'border-purple-500' },
    speed: { name: 'Quick Scan', Icon: BoltIcon, color: 'text-yellow-500', borderColor: 'border-yellow-500' },
    business: { name: 'Batch Scan', Icon: BuildingOffice2Icon, color: 'text-green-500', borderColor: 'border-green-500' },
    book: { name: 'Deep Scan', Icon: BookOpenIcon, color: 'text-blue-600', borderColor: 'border-blue-500' },
    scontrino: { name: 'Scontrino', Icon: ClipboardDocumentIcon, color: 'text-orange-500', borderColor: 'border-orange-500' },
    identity: { name: 'Doc. Identità', Icon: UserCircleIcon, color: 'text-indigo-600', borderColor: 'border-indigo-500' },
    fotografia: { name: 'Fotografia', Icon: CameraIcon, color: 'text-teal-600', borderColor: 'border-teal-500' },
    'no-ai': { name: 'Simple Scan', Icon: DocumentPlusIcon, color: 'text-slate-500', borderColor: 'border-slate-500' },
};

export const QueueView: React.FC<QueueViewProps> = ({ queue, currentTaskProgress }) => {
  const [initialTaskCount, setInitialTaskCount] = useState(0);

  useEffect(() => {
    // Set the initial total count only when a new batch starts
    if (queue.length > initialTaskCount) {
      setInitialTaskCount(queue.length);
    }
    // Reset when the queue is empty
    if (queue.length === 0) {
      setInitialTaskCount(0);
    }
  }, [queue]);

  if (queue.length === 0) {
    return null;
  }

  const completedTasks = initialTaskCount - queue.length;

  return (
    <div className="w-full p-4 text-left bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <div className="px-1 mb-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">
                Elaborazione File {Math.min(completedTasks + 1, initialTaskCount)} di {initialTaskCount}
            </h3>
        </div>
      <div className="flex flex-col gap-3">
        {queue.map((task, index) => {
          const isProcessing = index === 0;
          
          let statusIcon;
          if (isProcessing) {
            statusIcon = <LoadingSpinner className="w-6 h-6" />;
          } else {
            statusIcon = <ClockIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />;
          }

          const progressPercent = isProcessing && currentTaskProgress
            ? (currentTaskProgress.current / currentTaskProgress.total) * 100
            : 0;
            
          const { name: modeName, Icon: ModeIcon, color: modeColor, borderColor } = modeDisplayInfo[task.mode];

          return (
            <div
              key={`${task.sourceFileId}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4
                ${isProcessing ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-slate-100 dark:bg-slate-900/50'} ${borderColor}`}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{statusIcon}</div>
              <div className="flex-grow text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm truncate font-medium ${isProcessing ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`} title={task.name}>
                        {task.name}
                    </p>
                    {isProcessing && currentTaskProgress && task.pages > 1 && (
                         <p className="text-xs text-purple-600 dark:text-purple-400 font-mono flex-shrink-0 ml-2">
                            {currentTaskProgress.current}/{currentTaskProgress.total}
                         </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <span title={`Modalità: ${modeName}`}>
                        <ModeIcon className={`w-3.5 h-3.5 flex-shrink-0 ${modeColor}`} />
                     </span>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{isProcessing ? "In elaborazione..." : "In attesa"}</p>
                    {isProcessing && task.pages > 1 && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%`}}
                            ></div>
                        </div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};