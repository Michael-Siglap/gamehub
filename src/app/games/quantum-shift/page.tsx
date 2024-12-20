import QuantumShiftGame from "./QuantumShiftGame";

export default function QuantumShiftPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-4">Quantum Shift</h1>
      <QuantumShiftGame />
    </div>
  );
}
