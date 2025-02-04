import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <XCircle className="text-red-600 w-24 h-24" />
      <h1 className="text-3xl font-semibold text-red-800 mt-4">
        Payment Canceled
      </h1>
      <p className="text-lg text-red-700 mt-2">
        Your payment was not completed.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Go Back Home
      </button>
    </div>
  );
}
