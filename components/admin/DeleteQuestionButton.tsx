"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteQuestion } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Hapus soal ini? Tindakan tidak bisa dibatalkan.")) return;
    startTransition(async () => {
      await deleteQuestion(questionId);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
