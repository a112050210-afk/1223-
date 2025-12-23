
import React, { useState, useCallback } from 'react';
import { DietaryMode } from './types';
import { analyzeFoodImage } from './services/apiService';
import { COLORS } from './constants';

// Internal Components
const Header: React.FC = () => (
  <header className="mb-10 text-center">
    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-widest uppercase">
      AI Nutritional Assistant
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">卡路里查詢工具</h1>
    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
      上傳食物照片，獲得精準的營養分析與個人化飲食建議。
    </p>
  </header>
);

const Footer: React.FC = () => (
  <footer className="mt-16 text-center text-slate-400 text-sm pb-10 border-t border-slate-100 pt-8 w-full">
    <p className="mb-2 font-medium">卡路里查詢工具 • 極簡金屬風格</p>
    <p className="text-xs opacity-70">數據僅供參考，請以專業醫師建議為主</p>
  </footer>
);

// Simple component to render structured text more nicely
const AnalysisRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Simple heuristic to style headers and lists if they follow standard patterns
  const lines = content.split('\n');
  
  return (
    <div className="analysis-content">
      {lines.map((line, idx) => {
        // Detect bold markdown-like headers
        if (line.startsWith('**') || line.includes('：') && line.length < 30) {
          return <div key={idx} className="section-header">{line.replace(/\*\*/g, '')}</div>;
        }
        // Detect bullet points
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
          return <li key={idx}>{line.trim().substring(1).trim()}</li>;
        }
        // Empty lines
        if (!line.trim()) return <div key={idx} className="h-3" />;
        
        return <p key={idx} className="mb-3">{line}</p>;
      })}
    </div>
  );
};

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dietaryMode, setDietaryMode] = useState<DietaryMode>(DietaryMode.FAT_LOSS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('圖片大小不可超過 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage(base64String);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedImage) {
      setError('請先上傳食物照片');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeFoodImage(selectedImage, dietaryMode);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || '分析失敗，請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center max-w-2xl mx-auto selection:bg-slate-200">
      <Header />

      <main className="w-full space-y-8">
        {/* Upload Section */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center group transition-all hover:shadow-lg">
          <div className="w-full h-72 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 transition-colors group-hover:bg-slate-100/50">
            {selectedImage ? (
              <img 
                src={`data:image/jpeg;base64,${selectedImage}`} 
                alt="Uploaded food" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-700">點擊上傳食物照片</p>
                  <p className="mt-1 text-sm text-slate-400">或將檔案拖放到此處</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="mt-4 flex items-center text-slate-400 text-xs space-x-4">
            <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.172-1.172A2 2 0 0010.12 3H9.88a2 2 0 00-1.414.586L7.293 4.707A1 1 0 016.586 5H4z" /></svg> JPG / PNG</span>
            <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> Max 5MB</span>
          </div>
        </section>

        {/* Dietary Preference Selection */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center">
              <span className="mr-3 text-lg">🎯</span> 目標偏好模式
            </h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">Required</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(DietaryMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietaryMode(mode)}
                className={`py-4 px-6 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  dietaryMode === mode 
                    ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' 
                    : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleAnalysis}
          disabled={isAnalyzing}
          className="w-full py-5 rounded-[1.5rem] text-white font-bold text-lg shadow-xl disabled:opacity-70 flex items-center justify-center metallic-button"
        >
          {isAnalyzing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在分析營養成分...
            </div>
          ) : (
            <div className="flex items-center">
              <span>立即開始分析</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-5 rounded-3xl border border-rose-100 text-sm font-bold flex items-center animate-bounce">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <section className="bg-white p-10 rounded-[2.5rem] metallic-gradient animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">分析報告</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            {result === '{{無法分析}}' ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-4xl mb-4">🍽️?</div>
                <p className="text-slate-500 font-bold">抱歉，影像中似乎不包含食物。</p>
                <p className="text-slate-400 text-sm mt-2">請確認拍攝主體為餐點並重新上傳。</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
                <AnalysisRenderer content={result} />
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
