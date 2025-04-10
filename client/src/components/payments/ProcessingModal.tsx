import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader2, Clock } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "complete";
}

interface ProcessingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  steps: Step[];
  onCancel: () => void;
}

export default function ProcessingModal({ 
  isOpen, 
  title, 
  message, 
  steps: initialSteps,
  onCancel 
}: ProcessingModalProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  // Simulate the processing steps
  useEffect(() => {
    if (!isOpen) return;

    // Reset steps when the modal opens
    setSteps(initialSteps);

    // Find the currently processing step
    const processingIndex = steps.findIndex(step => step.status === "processing");
    if (processingIndex === -1) return;

    // Simulate the step completion after a delay
    const timer = setTimeout(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        // Complete the current step
        newSteps[processingIndex] = { ...newSteps[processingIndex], status: "complete" };
        
        // Start the next step if there is one
        if (processingIndex + 1 < newSteps.length) {
          newSteps[processingIndex + 1] = { ...newSteps[processingIndex + 1], status: "processing" };
        }
        return newSteps;
      });
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [isOpen, steps, initialSteps]);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary mb-6 mx-auto">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        
        <div className="bg-gray-50 rounded-md p-3 text-left mb-4">
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                  step.status === "complete" 
                    ? "bg-primary flex items-center justify-center"
                    : step.status === "processing"
                      ? "bg-primary flex items-center justify-center animate-pulse"
                      : "bg-gray-300"
                }`}>
                  {step.status === "complete" ? (
                    <CheckIcon className="text-white text-xs" />
                  ) : step.status === "processing" ? (
                    <Clock className="text-white text-xs" />
                  ) : null}
                </div>
                <p className={`ml-3 text-sm ${
                  step.status === "pending" ? "text-gray-400" : "text-gray-600"
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
