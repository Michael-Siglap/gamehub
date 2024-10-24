// src/components/Modal.tsx
import { Button } from "@/components/ui/button";

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({
  title,
  message,
  onConfirm,
  onCancel,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 sm:w-96 md:w-1/2 lg:w-1/3 max-h-screen overflow-y-auto flex flex-col">
        <h2 id="modal-title" className="text-xl font-semibold mb-4 text-center">
          {title}
        </h2>
        <p className="mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4 mt-auto">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            No, Go to Dashboard
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            Yes, Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
