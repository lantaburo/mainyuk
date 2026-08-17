"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Trophy, RefreshCcw, Star, Volume2, VolumeX, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export type QuizQuestion = {
  id: string | number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

interface QuizPlayerProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizPlayer({ title, questions, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStartedBgm, setHasStartedBgm] = useState(false);



  useEffect(() => {
    const bgm = new Audio("/sounds/shameless.mp3");
    bgm.loop = true;
    bgm.volume = 0.3;
    bgm.playbackRate = 0.85; // Diperlambat sedikit
    setBgmAudio(bgm);

    return () => {
      bgm.pause();
      bgm.src = "";
    };
  }, []);

  useEffect(() => {
    if (bgmAudio) bgmAudio.muted = isMuted;
  }, [isMuted, bgmAudio]);

  const playYeaySound = () => {
    if (!isMuted) {
      const correct = new Audio("/sounds/yaeh.mp3");
      correct.volume = 0.8;
      correct.play().catch(e => console.error("Audio blocked", e));
    }
  };

  const playWrongSound = () => {
    if (!isMuted) {
      const wrong = new Audio("/sounds/wrong.mp3");
      wrong.volume = 0.8;
      wrong.play().catch(e => console.error("Audio blocked", e));
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnswerChecked) {
      timeout = setTimeout(() => {
        handleNextQuestion();
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isAnswerChecked, currentIndex]);

  const currentQuestion = questions[currentIndex];

  if (!questions || questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-12 text-center bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-slate-800">Soal Belum Tersedia</h2>
        <p className="text-slate-600 mt-2">Belum ada soal untuk bagian ini.</p>
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (!hasStartedBgm && bgmAudio && !isMuted) {
      bgmAudio.play().catch(e => console.error("Auto-play blocked", e));
      setHasStartedBgm(true);
    }
    if (!isAnswerChecked) {
      setSelectedOption(index);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswerChecked(true);
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playYeaySound();
      fireConfetti();
    } else {
      playWrongSound();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
      if (bgmAudio) bgmAudio.pause();
      if (!isMuted) {
        const finishAudio = new Audio("/sounds/PapanSkorCeria.mp3");
        finishAudio.volume = 0.8;
        finishAudio.play().catch(e => console.error("Audio blocked", e));
      }
      if (onComplete) onComplete(score, questions.length);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Luar Biasa!";
    if (percentage < 50) message = "Jangan Menyerah, Coba Lagi!";
    else if (percentage < 80) message = "Kerja Bagus!";

    return (
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 rounded-full" />
            <Trophy className="w-24 h-24 text-yellow-500 relative z-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-800">{message}</h2>
            <p className="text-slate-600 font-medium">Kamu telah menyelesaikan {title}</p>
          </div>

          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-semibold">Skor Kamu</span>
              <span className="text-4xl font-black text-indigo-600">{percentage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Benar</span>
              <span className="text-2xl font-bold text-emerald-500">{score} / {questions.length}</span>
            </div>
          </div>

          <button 
            onClick={handleRetry}
            className="group relative flex items-center justify-center gap-2 w-full max-w-sm py-4 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300"
          >
            <RefreshCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            Main Lagi Yuk!
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col min-h-[600px]">
      {/* Header & Progress */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">{title}</h1>
          <div className="flex items-center gap-3">
            {/* Reading Mode */}
            <button 
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={cn("p-2 rounded-full transition-colors", isReadingMode ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}
              title="Mode Baca"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            {/* Mute */}
            <button 
              onClick={() => {
                setIsMuted(!isMuted);
                if (isMuted && bgmAudio && !hasStartedBgm) {
                  bgmAudio.play().catch(e => console.error(e));
                  setHasStartedBgm(true);
                }
              }}
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900 dark:hover:text-indigo-400 transition-colors"
              title={isMuted ? "Bunyikan Suara" : "Matikan Suara"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold shadow-inner">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span>Skor: {score * 100}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-500">
            <span>Soal {currentIndex + 1} dari {questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-200/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className={cn(
              "rounded-3xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden transition-colors duration-300",
              isReadingMode 
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900" 
                : "bg-white/80 backdrop-blur-md border-white/50 dark:bg-slate-900/80 dark:border-slate-700"
            )}>
              {!isReadingMode && (
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
              
              <h2 className={cn(
                "font-extrabold mb-8 leading-tight transition-all duration-300",
                isReadingMode 
                  ? "text-3xl md:text-4xl text-amber-900 dark:text-amber-100" 
                  : "text-2xl md:text-3xl text-slate-800 dark:text-slate-100"
              )}>
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isWrong = isSelected && !isCorrect;
                  
                  let stateClass = "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950";
                  
                  if (isAnswerChecked) {
                    if (isCorrect) {
                      stateClass = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-500/20 shadow-lg scale-[1.02] dark:bg-emerald-950 dark:text-emerald-100";
                    } else if (isWrong) {
                      stateClass = "bg-rose-50 border-rose-500 text-rose-800 opacity-50 dark:bg-rose-950 dark:text-rose-100";
                    } else {
                      stateClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500";
                    }
                  } else if (isSelected) {
                    stateClass = "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-md shadow-indigo-500/20 scale-[1.02] dark:bg-indigo-950 dark:text-indigo-100";
                  }

                  const labels = ["A", "B", "C", "D"];

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswerChecked ? { scale: 1.02 } : {}}
                      whileTap={!isAnswerChecked ? { scale: 0.98 } : {}}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerChecked}
                      className={`relative flex items-center p-4 border-2 rounded-2xl text-left font-semibold text-lg transition-all duration-200 ${stateClass}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-black ${isAnswerChecked && isCorrect ? 'bg-emerald-500 text-white' : isAnswerChecked && isWrong ? 'bg-rose-500 text-white' : isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {labels[idx]}
                      </div>
                      <span className="flex-1">{option}</span>
                      
                      {isAnswerChecked && isCorrect && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-emerald-500">
                          <CheckCircle2 className="w-8 h-8" />
                        </motion.div>
                      )}
                      {isAnswerChecked && isWrong && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-rose-500">
                          <XCircle className="w-8 h-8" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Explanation Section */}
            <AnimatePresence>
              {isAnswerChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  className="mb-6"
                >
                  <div className={`p-6 rounded-3xl border-2 ${selectedOption === currentQuestion.correctIndex ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'}`}>
                    <h3 className={`font-black text-xl mb-2 flex items-center gap-2 ${selectedOption === currentQuestion.correctIndex ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {selectedOption === currentQuestion.correctIndex ? (
                        <>✨ Hore! Jawabanmu Benar!</>
                      ) : (
                        <>💡 Yuk, Pelajari Pembahasannya!</>
                      )}
                    </h3>
                    <p className="text-slate-700 font-medium leading-relaxed text-lg">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end mt-4 pt-4 pb-6 sticky bottom-0 z-20 md:static md:bg-transparent md:p-0 md:mt-auto">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className={`py-4 px-10 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${selectedOption === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-1'}`}
            >
              Cek Jawaban
            </button>
          ) : (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleNextQuestion}
              className="group flex items-center gap-3 py-4 px-10 rounded-2xl font-black text-lg bg-slate-800 text-white hover:bg-slate-900 transition-all duration-300 shadow-xl hover:-translate-y-1 w-full md:w-auto justify-center"
            >
              {currentIndex < questions.length - 1 ? 'Soal Selanjutnya' : 'Selesai'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
