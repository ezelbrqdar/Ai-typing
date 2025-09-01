
import React, { useState, useCallback } from 'react';
import { enhanceArabicText } from './services/geminiService';
import type { NovelAnalysis } from './types';
import Loader from './components/Loader';

const Header: React.FC = () => (
  <header className="text-center p-6 border-b border-slate-700">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
      محسن النصوص الروائية
    </h1>
    <p className="text-slate-400 mt-2 text-lg">
      ارتقِ بكتابتك العربية إلى مستوى أدبي بمساعدة الذكاء الاصطناعي
    </p>
  </header>
);

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, isLoading }) => (
  <div className="w-full">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      placeholder="اكتب أو الصق النص هنا..."
      className="w-full h-48 p-4 bg-slate-800 text-slate-200 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 resize-none text-lg"
    />
  </div>
);

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, isLoading, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className="w-full md:w-auto px-12 py-3 bg-sky-600 text-white font-bold text-lg rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-sky-900/50"
  >
    {isLoading ? <Loader /> : 'تحسين النص'}
  </button>
);

interface OutputCardProps {
  title: string;
  text: string;
  isLoading: boolean;
  colorClass: string;
}

const OutputCard: React.FC<OutputCardProps> = ({ title, text, isLoading, colorClass }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className={`p-4 border-b-4 ${colorClass} flex justify-between items-center`}>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {text && !isLoading && (
          <button
            onClick={handleCopy}
            className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
            aria-label={`Copy ${title} text`}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-5 text-slate-300 text-base leading-relaxed flex-grow min-h-[150px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
             <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{text || '...'}</p>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputs, setOutputs] = useState<NovelAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) {
      setError('الرجاء إدخال نص أولاً.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputs(null);

    try {
      const result = await enhanceArabicText(inputText);
      setOutputs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-sky-500 selection:text-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <TextInput value={inputText} onChange={setInputText} isLoading={isLoading} />
          <div className="flex justify-center">
            <SubmitButton onClick={handleSubmit} isLoading={isLoading} disabled={!inputText.trim()} />
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
            {error}
          </div>
        )}

        {(isLoading || outputs) && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <OutputCard
              title="نص مصحح"
              text={outputs?.corrected ?? ''}
              isLoading={isLoading}
              colorClass="border-green-500"
            />
            <OutputCard
              title="نص محسن"
              text={outputs?.improved ?? ''}
              isLoading={isLoading}
              colorClass="border-blue-500"
            />
            <OutputCard
              title="نص أدبي"
              text={outputs?.literary ?? ''}
              isLoading={isLoading}
              colorClass="border-purple-500"
            />
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
