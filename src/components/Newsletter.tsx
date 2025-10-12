import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      setSuccess(false);
      return;
    }
    setError(null);
    setSuccess(true);
    setEmail("");
  };

  return (
    <section className="py-24 bg-gradient-to-r from-yellow-100 to-red-100">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Stay Connected
        </h2>
        <p className="mt-3 text-slate-700">
          Subscribe to our newsletter and never miss an update.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-800 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-red-800 text-white font-bold shadow hover:bg-red-700 transition"
          >
            Subscribe
          </button>
        </form>
        {error && <p className="mt-3 text-red-600">{error}</p>}
        {success && <p className="mt-3 text-green-600">Thank you for subscribing!</p>}
      </div>
    </section>
  );
}
