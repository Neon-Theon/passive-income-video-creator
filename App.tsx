
import React from 'react';
import type { WorkflowStep, GeneratedAssets } from './types';
import { WorkflowStepStatus } from './types';
import * as geminiService from './services/geminiService';
import WorkflowNode from './components/WorkflowNode';
import DownloadSection from './components/DownloadSection';
import { SparklesIcon } from './components/icons';

const INITIAL_WORKFLOW: WorkflowStep[] = [
  { id: 'script', title: '1. Generate Viral Script', description: 'AI researches the topic and writes an engaging script with affiliate placeholders.', status: WorkflowStepStatus.PENDING },
  { id: 'video', title: '2. Create Stunning Video', description: 'The script is turned into a video with AI voiceover, music, and visuals.', status: WorkflowStepStatus.PENDING },
  { id: 'thumbnail', title: '3. Design Clickable Thumbnail', description: 'A high-impact thumbnail is created to maximize click-through rate.', status: WorkflowStepStatus.PENDING },
  { id: 'seo', title: '4. Optimize SEO & Metadata', description: 'Generates a viral title, description with timestamps, and tags.', status: WorkflowStepStatus.PENDING },
];

const App: React.FC = () => {
  const [topic, setTopic] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [workflow, setWorkflow] = React.useState<WorkflowStep[]>(INITIAL_WORKFLOW);
  const [finalAssets, setFinalAssets] = React.useState<GeneratedAssets | null>(null);

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => prev.map(step => step.id === id ? { ...step, ...updates } : step));
  };

  const resetState = () => {
    setTopic('');
    setIsGenerating(false);
    setWorkflow(INITIAL_WORKFLOW);
    setFinalAssets(null);
    const resultsElement = document.getElementById('results');
    if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setFinalAssets(null);
    setWorkflow(INITIAL_WORKFLOW);

    const finalTopic = topic.trim() === '' ? 'Top 5 Passive Income Streams for Beginners' : topic;
    const assets: Partial<GeneratedAssets> = {};

    try {
      // Step 1: Script
      updateStep('script', { status: WorkflowStepStatus.RUNNING });
      const script = await geminiService.generateScript(finalTopic);
      assets.script = script;
      updateStep('script', { status: WorkflowStepStatus.COMPLETED, result: script });
      
      // Step 2: Video (runs in parallel with thumbnail and seo)
      const videoPromise = (async () => {
        updateStep('video', { status: WorkflowStepStatus.RUNNING, longRunningMessage: "Initializing video generation..." });
        const videoUrl = await geminiService.generateVideo(script, (message) => {
          updateStep('video', { longRunningMessage: message });
        });
        assets.videoUrl = videoUrl;
        updateStep('video', { status: WorkflowStepStatus.COMPLETED, result: 'Video generated successfully.' });
      })();

      // Step 3 & 4 (run in parallel)
      const thumbnailPromise = (async () => {
          updateStep('thumbnail', { status: WorkflowStepStatus.RUNNING });
          const tempTitleForThumbnail = `How to earn passive income with ${finalTopic}`;
          const thumbnailUrl = await geminiService.generateThumbnail(tempTitleForThumbnail);
          assets.thumbnailUrl = thumbnailUrl;
          updateStep('thumbnail', { status: WorkflowStepStatus.COMPLETED, result: 'Thumbnail created.' });
      })();

      const seoPromise = (async () => {
          updateStep('seo', { status: WorkflowStepStatus.RUNNING });
          const seo = await geminiService.generateSeoMetadata(script);
          assets.seo = seo;
          updateStep('seo', { status: WorkflowStepStatus.COMPLETED, result: seo });
      })();
      
      await Promise.all([videoPromise, thumbnailPromise, seoPromise]);

      setFinalAssets(assets as GeneratedAssets);
    } catch (error) {
      console.error("Workflow failed:", error);
      const runningStep = workflow.find(s => s.status === WorkflowStepStatus.RUNNING);
      if (runningStep) {
        updateStep(runningStep.id, { status: WorkflowStepStatus.ERROR, error: (error as Error).message });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScriptEdit = (newScript: string) => {
    updateStep('script', { result: newScript });
    // This is where you could add logic to re-run subsequent steps
    console.log("Script updated. In a full app, you might re-trigger video/SEO generation.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-gray-700/[0.2] z-0"></div>
      <main className="relative z-10 flex flex-col items-center">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Passive Income Video Creator
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Turn any passive income topic into a ready-to-upload, monetizable YouTube video in minutes.
          </p>
        </header>

        {!finalAssets && (
          <div className="w-full max-w-2xl mx-auto bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
            <label htmlFor="topic" className="block text-lg font-medium mb-2 text-gray-200">
              Enter a Topic or Keyword
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Affiliate marketing for beginners'"
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                <SparklesIcon className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Start Creating'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Leave blank for a popular, evergreen topic.</p>
          </div>
        )}

        {isGenerating && (
            <div className="mt-12 w-full max-w-2xl">
              <div className="space-y-4">
                {workflow.map((step, index) => (
                  <WorkflowNode
                    key={step.id}
                    step={step}
                    isLast={index === workflow.length - 1}
                    onEdit={step.id === 'script' ? handleScriptEdit : undefined}
                  />
                ))}
              </div>
            </div>
        )}
        
        {finalAssets && <DownloadSection assets={finalAssets} onReset={resetState} />}

      </main>
    </div>
  );
};

export default App;
