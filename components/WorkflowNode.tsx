
import React from 'react';
import type { WorkflowStep } from '../types';
import { WorkflowStepStatus } from '../types';
import { CheckCircleIcon, ScriptIcon, SeoIcon, ThumbnailIcon, VideoIcon, XCircleIcon, ArrowRightIcon } from './icons';

interface WorkflowNodeProps {
  step: WorkflowStep;
  isLast: boolean;
  onEdit?: (content: string) => void;
}

const ICONS: { [key: string]: React.ReactNode } = {
  script: <ScriptIcon className="w-8 h-8 text-sky-400" />,
  video: <VideoIcon className="w-8 h-8 text-rose-400" />,
  thumbnail: <ThumbnailIcon className="w-8 h-8 text-amber-400" />,
  seo: <SeoIcon className="w-8 h-8 text-lime-400" />,
};

const Spinner: React.FC = () => (
  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const getStatusIndicator = (status: WorkflowStepStatus) => {
  switch (status) {
    case WorkflowStepStatus.RUNNING:
      return <Spinner />;
    case WorkflowStepStatus.COMPLETED:
      return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
    case WorkflowStepStatus.ERROR:
      return <XCircleIcon className="w-6 h-6 text-red-400" />;
    default:
      return <div className="w-6 h-6 border-2 border-dashed border-gray-600 rounded-full"></div>;
  }
};

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ step, isLast, onEdit }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState(step.result || '');

  React.useEffect(() => {
    if (step.result) {
      setEditableContent(step.result);
    }
  }, [step.result]);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editableContent);
    }
    setIsEditing(false);
  };

  const hasContent = step.result || step.error || step.longRunningMessage;

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gray-800 border-2 ${
            step.status === WorkflowStepStatus.RUNNING ? 'border-blue-500 animate-pulse' :
            step.status === WorkflowStepStatus.COMPLETED ? 'border-green-500' :
            step.status === WorkflowStepStatus.ERROR ? 'border-red-500' :
            'border-gray-700'
        }`}>
          {ICONS[step.id]}
        </div>
        {!isLast && <div className="w-0.5 h-20 bg-gray-700 mt-2"></div>}
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4 flex-1 backdrop-blur-sm border border-gray-700/50 min-h-[120px]">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
            </div>
            {getStatusIndicator(step.status)}
        </div>
        
        {hasContent && (
          <div className="mt-3 pt-3 border-t border-gray-700 text-sm">
            {step.status === WorkflowStepStatus.ERROR && <p className="text-red-400 font-mono bg-red-900/20 p-2 rounded">{step.error}</p>}
            {step.status === WorkflowStepStatus.RUNNING && step.longRunningMessage && <p className="text-blue-300">{step.longRunningMessage}</p>}
            {step.status === WorkflowStepStatus.COMPLETED && step.result && (
              isEditing ? (
                  <div>
                    <textarea 
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="w-full h-40 bg-gray-900 text-white p-2 rounded border border-gray-600 font-mono text-xs"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-bold rounded">Save</button>
                      <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-xs font-bold rounded">Cancel</button>
                    </div>
                  </div>
              ) : (
                <div>
                    <p className="text-gray-300 font-mono whitespace-pre-wrap text-xs max-h-24 overflow-y-auto bg-gray-900/50 p-2 rounded">
                        {typeof step.result === 'string' ? step.result.substring(0, 300) + '...' : JSON.stringify(step.result, null, 2)}
                    </p>
                    {onEdit && (
                        <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300 text-xs mt-2">Edit Script</button>
                    )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowNode;
