import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <CheckCircle className="text-green-600 w-24 h-24" />
      <h1 className="text-3xl font-semibold text-green-800 mt-4">
        Payment Successful!
      </h1>
      <p className="text-lg text-green-700 mt-2">Thank you for your purchase.</p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Go Back Home
      </button>
    </div>
  );
}
