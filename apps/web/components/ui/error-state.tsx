import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an error loading this data. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-red-50/50 border-red-100">
      <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
      <h3 className="text-sm font-bold text-red-900 mb-1">{title}</h3>
      <p className="text-sm text-red-700 max-w-sm mb-4">{message}</p>
      
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
          Retry
        </Button>
      )}
    </div>
  );
}
