import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLogin } from "../interfaces/UserLogin";
import { login } from "../api/authAPI";
import AuthService from "../utils/auth";
import { useLoggedIn } from "../context/LoggedInContext";

const Login: React.FC = () => {
  const [form, setForm] = useState<UserLogin>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setLoggedIn } = useLoggedIn();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const userLoginData: UserLogin = {
    username: form.username,
    password: form.password,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(userLoginData);
      AuthService.login(data.token);
      console.log("Login successful:", data);
      setLoggedIn(AuthService.loggedIn());
      navigate("/home");
    } catch (err) {
      console.error("Error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex p-4 justify-center bg-color_2">
      <div className="bg-color_1 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full p-2 border text-color_1 rounded bg-color_2"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-lg mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-2 border text-color_1 rounded bg-color_2"
              placeholder="password"
            />
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`ml-2 px-4 py-2 bg-color_3 text-white rounded-lg hover:bg-color_5 transition-colors ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? "Logging in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
