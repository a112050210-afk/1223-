
import React, { useState, useCallback } from 'react';
import { DietaryMode } from './types';
import { analyzeFoodImage } from './services/apiService';
import { COLORS } from './constants';

// Internal Components
const Header: React.FC = () => (
  <header className="mb-8 text-center">
    <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">卡路里查詢工具</h1>
    <p className="text-slate-500 font-medium">快速辨識餐點內容與熱量分析</p>
  </header>
);

const Footer: React.FC = () => (
  <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
    &copy; {new Date().getFullYear()} 卡路里查詢工具 • 極簡金屬風格
  </footer>
);

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dietaryMode, setDietaryMode] = useState<DietaryMode>(DietaryMode.FAT_LOSS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-2xl mx-auto">
      <Header />

      <main className="w-full space-y-6">
        {/* Upload Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-slate-50">
            {selectedImage ? (
              <img 
                src={`data:image/jpeg;base64,${selectedImage}`} 
                alt="Uploaded food" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">點擊或拖放照片到此處</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">支援格式：JPG, PNG (最大 5MB)</p>
        </section>

        {/* Dietary Preference Selection */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
            <span className="mr-2">🥗</span> 飲食偏好模式
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(DietaryMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietaryMode(mode)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  dietaryMode === mode 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
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
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center metallic-button"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              分析中...
            </>
          ) : '開始分析'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <section className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 metallic-gradient animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">分析結果</h3>
            {result === '{{無法分析}}' ? (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium italic">系統無法識別此影像為食物，請重新上傳。</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base">
                {result}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
