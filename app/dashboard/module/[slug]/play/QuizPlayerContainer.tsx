"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuizPlayer, { QuizQuestion } from "@/components/quiz/QuizPlayer";
import { Loader2 } from "lucide-react";

export default function QuizPlayerContainer({ 
  moduleId, 
  title, 
  subjectSlug,
  questions,
  studentId
}: { 
  moduleId: string;
  title: string;
  subjectSlug: string;
  questions: QuizQuestion[];
  studentId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (score: number, total: number) => {
    setIsSubmitting(true);
    
    try {
      const finalScore = Math.round((score / total) * 100);
      
      const res = await fetch("/api/edu/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          score: finalScore,
          studentId
        }),
      });
      
      if (res.ok) {
        // Wait a brief moment then go back to the subject page to see unlocked modules
        setTimeout(() => {
          router.push(`/dashboard/subject/${subjectSlug}`);
          router.refresh(); // Refresh to update locks
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Don't set false immediately so UI doesn't jump back
    }
  };

  return (
    <div className="relative">
      <QuizPlayer title={title} questions={questions} onComplete={handleComplete} />
      
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Menyimpan Nilai...</h3>
            <p className="text-gray-500 mt-2 text-center">Mohon tunggu, kami sedang mencatat progres belajarmu.</p>
          </div>
        </div>
      )}
    </div>
  );
}
