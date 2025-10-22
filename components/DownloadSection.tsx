
import React from 'react';
import type { GeneratedAssets } from '../types';
import { DownloadIcon } from './icons';

interface DownloadSectionProps {
  assets: GeneratedAssets | null;
  onReset: () => void;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ assets, onReset }) => {
  if (!assets) return null;

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSeo = () => {
    const content = `TITLE:\n${assets.seo.title}\n\nDESCRIPTION:\n${assets.seo.description}\n\nTAGS:\n${assets.seo.tags.join(', ')}`;
    downloadTextFile(content, 'video_metadata.txt');
  }

  return (
    <section id="results" className="mt-12 w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-500">Your Viral Video Kit is Ready!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Video & Thumbnail */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-xl mb-2">Generated Video</h3>
            {assets.videoUrl ? (
                <video controls src={assets.videoUrl} className="w-full rounded-lg shadow-lg"></video>
            ) : <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center">Video Error</div>}
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2">Generated Thumbnail</h3>
            {assets.thumbnailUrl ? (
                <img src={assets.thumbnailUrl} alt="Generated Thumbnail" className="w-full rounded-lg shadow-lg" />
            ) : <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center">Thumbnail Error</div>}
          </div>
        </div>

        {/* Right Column: SEO & Downloads */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-xl mb-2">Title, Description & Tags</h3>
            <div className="bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm space-y-4">
              <div>
                <p className="font-bold text-lime-400">Title:</p>
                <p className="text-gray-300">{assets.seo.title}</p>
              </div>
              <div>
                <p className="font-bold text-lime-400">Description:</p>
                <p className="text-gray-300 whitespace-pre-wrap">{assets.seo.description}</p>
              </div>
              <div>
                <p className="font-bold text-lime-400">Tags:</p>
                <p className="text-gray-300">{assets.seo.tags.join(', ')}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-xl mb-2">Downloads</h3>
            <div className="flex flex-col space-y-3">
              <a href={assets.videoUrl} download="generated_video.mp4" className="flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <DownloadIcon className="w-5 h-5" /> Download Video (MP4)
              </a>
              <a href={assets.thumbnailUrl} download="generated_thumbnail.jpg" className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <DownloadIcon className="w-5 h-5" /> Download Thumbnail (JPG)
              </a>
              <button onClick={handleDownloadSeo} className="flex items-center justify-center gap-2 w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <DownloadIcon className="w-5 h-5" /> Download Metadata (TXT)
              </button>
            </div>
          </div>
        </div>
      </div>
        <div className="text-center mt-10">
            <button 
                onClick={onReset}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
                Create Another Video
            </button>
        </div>
    </section>
  );
};

export default DownloadSection;
