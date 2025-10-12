import { useState } from "react";
import { z } from "zod";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");

export default function Footer() {
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
    <footer className="relative bg-gradient-to-br from-[#8B0000] via-[#7a0000] to-[#D4AF37] text-white overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.4),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Newsletter Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Stay Connected
          </h2>
          <p className="mt-3 text-yellow-100/90">
            Subscribe to receive ministry updates, upcoming events, and inspiring messages.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-white/30 bg-white/10 placeholder-white/70 text-white focus:ring-2 focus:ring-yellow-300 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-yellow-400 text-red-900 font-bold shadow hover:bg-yellow-300 transition"
            >
              Subscribe
            </button>
          </form>

          {error && <p className="mt-3 text-red-300">{error}</p>}
          {success && (
            <p className="mt-3 text-green-300">Thank you for subscribing!</p>
          )}
        </div>

        {/* Info + Links */}
        <div className="grid md:grid-cols-3 gap-10 mt-16 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">
              Visit Us
            </h3>
            <p className="text-yellow-100/90 flex justify-center md:justify-start items-center gap-2">
              <MapPin className="w-4 h-4" /> 8918 Old Hickory Blvd, Nashville, TN
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">
              Contact
            </h3>
            <p className="text-yellow-100/90 flex justify-center md:justify-start items-center gap-2">
              <Mail className="w-4 h-4" /> info@winnerschapelnashville.org
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-white/10 hover:bg-yellow-300 hover:text-red-900 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/10 hover:bg-yellow-300 hover:text-red-900 transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/10 hover:bg-yellow-300 hover:text-red-900 transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="mt-16 border-t border-white/20" />

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-yellow-100/90 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-300 to-red-500" />
            <span className="text-xl font-bold">Dominion Connect</span>
          </div>

          <p>
            &copy; {new Date().getFullYear()} Winners Chapel Nashville. All Rights Reserved.
          </p>

          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-300 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
