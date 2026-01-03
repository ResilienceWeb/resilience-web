"use client";

/**
 * Step indicator showing progress through the import wizard
 */

import { Check } from "lucide-react";
import { cn } from "@components/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: "Upload", description: "Upload CSV file" },
  { number: 2, title: "Map", description: "Map columns to fields" },
  { number: 3, title: "Preview", description: "Review and validate data" },
  { number: 4, title: "Import", description: "Complete the import" },
];

interface ImportStepIndicatorProps {
  currentStep: number;
}

export function ImportStepIndicator({ currentStep }: ImportStepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {STEPS.map((step, stepIdx) => {
          const isComplete = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li
              key={step.number}
              className={cn(
                "relative",
                stepIdx !== STEPS.length - 1 && "flex-1"
              )}
            >
              {stepIdx !== STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-8 top-4 h-0.5 w-full transition-colors",
                    isComplete ? "bg-primary" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}

              <div className="group relative flex flex-col items-center">
                <span className="flex h-9 items-center">
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      isComplete &&
                        "bg-primary border-2 border-primary",
                      isCurrent &&
                        "border-2 border-primary bg-white",
                      !isComplete &&
                        !isCurrent &&
                        "border-2 border-gray-300 bg-white"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isCurrent ? "text-primary" : "text-gray-500"
                        )}
                      >
                        {step.number}
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-2 flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : "text-gray-900"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
