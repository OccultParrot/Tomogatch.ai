import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpData } from "../interfaces/SignUpData";
import { signup } from "../api/authAPI";

const Signup: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPass: "",
    bio: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPass) {
      alert("Password does not match, please try again.");
      return;
    }

    setError(null);
    setLoading(true);

    const newUser: SignUpData = {
      username: form.username,
      email: form.email,
      password: form.password,
      bio: form.bio,
    };

    try {
      await signup(newUser);
      console.log("User signed up successfully");

      // Redirect the user to the login page
      navigate("/login");
    } catch (err) {
      console.error("Signup failed", err);
      setError("Failed to sign up, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-color_2 p-4 min-h-screen flex flex-col items-center rounded-bl rounded-br">
      <div className="bg-color_1 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl mb-6">Sign Up</h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-md flex flex-col space-y-4"
        >
          <input
            type="email"
            name="email"
            placeholder="sample@email.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="username"
            placeholder="yourUsername"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="confirmPass"
            placeholder="re-type password"
            value={form.confirmPass}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="bio"
            placeholder="tell us a little about yourself"
            value={form.bio}
            onChange={handleChange}
            maxLength={200}
            className="w-full p-2 border rounded"
          />
          {error && <p className="text-white">{error}</p>}
          <button
            type="submit"
            className={`bg-color_3 px-6 py-2 rounded-lg hover:bg-color_5 transition-colors ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Start Adopting"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
