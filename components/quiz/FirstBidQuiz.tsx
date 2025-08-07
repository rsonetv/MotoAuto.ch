"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const questions = [
  {
    question: "Co to jest cena minimalna (rezerwowa)?",
    answers: [
      "Najniższa kwota, za jaką można kupić przedmiot od razu.",
      "Ukryta minimalna cena, którą sprzedający jest gotów zaakceptować.",
      "Cena wywoławcza aukcji.",
    ],
    correctAnswer:
      "Ukryta minimalna cena, którą sprzedający jest gotów zaakceptować.",
  },
  {
    question: "Co się stanie, gdy zalicytujesz w ostatniej minucie aukcji?",
    answers: [
      "Aukcja natychmiast się kończy.",
      "Czas do końca aukcji zostaje przedłużony o kilka minut.",
      "Twoja oferta jest nieważna.",
    ],
    correctAnswer: "Czas do końca aukcji zostaje przedłużony o kilka minut.",
  },
  {
    question: "Czy złożona oferta w licytacji jest wiążąca?",
    answers: ["Tak, każda oferta jest prawnie wiążącą umową.", "Nie, można ją wycofać w dowolnym momencie.", "Tylko jeśli wygrasz aukcję."],
    correctAnswer: "Tak, każda oferta jest prawnie wiążącą umową.",
  }
];

interface FirstBidQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCompleted: () => void;
}

export function FirstBidQuiz({
  isOpen,
  onClose,
  onQuizCompleted,
}: FirstBidQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    if (!selectedAnswer) {
      setError("Proszę wybrać odpowiedź.");
      return;
    }

    if (selectedAnswer !== currentQuestion.correctAnswer) {
      setError("Niestety, to nie jest poprawna odpowiedź. Spróbuj ponownie.");
      return;
    }
    
    setError(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizCompletion();
    }
  };
  
  const handleQuizCompletion = async () => {
    try {
      const response = await fetch("/api/user/complete-quiz", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać wyniku quizu.");
      }
      
      toast.success("Gratulacje! Pomyślnie ukończyłeś quiz. Możesz teraz licytować.");
      onQuizCompleted();

    } catch (error) {
      console.error(error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Szybki quiz przed pierwszą licytacją</DialogTitle>
          <DialogDescription>
            Odpowiedz na kilka pytań, aby upewnić się, że znasz zasady.
          </DialogDescription>
        </DialogHeader>
        <div>
          <h3 className="mb-4 font-semibold">
            Pytanie {currentQuestionIndex + 1}/{questions.length}
          </h3>
          <p className="mb-4">{currentQuestion.question}</p>
          <RadioGroup
            onValueChange={(value) => {
              setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: value });
              setError(null);
            }}
          >
            {currentQuestion.answers.map((answer) => (
              <div key={answer} className="flex items-center space-x-2">
                <RadioGroupItem value={answer} id={answer} />
                <Label htmlFor={answer}>{answer}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? "Następne pytanie" : "Zakończ quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}