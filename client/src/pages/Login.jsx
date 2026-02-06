import { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-96 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
        {}
        <h2 className="mb-8 text-center">
          {}
          <span className="block text-gray-500 text-sm font-semibold tracking-wide uppercase mb-1">
            Welcome Back
          </span>

          {}
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-600 text-xl font-medium mr-1">
              Login to
            </span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tighter">
              Bug<span className="text-blue-600">Bridge</span>
            </span>
          </div>
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md hover:shadow-lg transform active:scale-95 duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-bold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
