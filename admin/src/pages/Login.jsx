import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";
import { Mail, Lock, LogIn, ShieldCheck, User } from "lucide-react";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAToken, backendURL } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === "Admin") {
        const res = await axios.post(backendURL + "/api/admin/login", {
          email,
          password,
        });
        const data = res.data;

        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Login successful!");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendURL + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Login successful!");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <span className="text-primary font-bold text-2xl">SwiftCare</span>

          <div className="mt-2 flex justify-center gap-4">
            <button
              onClick={() => setState("Admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                state === "Admin"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <ShieldCheck size={18} />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setState("Doctor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                state === "Doctor"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <User size={18} />
              <span>Doctor</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold text-center mb-6">
            <span className="text-primary">{state}</span> Login
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Login
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
