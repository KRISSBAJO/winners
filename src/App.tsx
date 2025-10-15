import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonial from "./components/Testimonial";
import Footer from "./components/Footer";
import CallToAction from "./components/CallToAction";
import Ministries from "./components/Ministries";
import Events from "./components/Events";
import HomeFellowship from "./components/HomeFellowship";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main>
        <Hero />
        <Features />
        <HomeFellowship />
        <Ministries />
        <Events />
        <Testimonial />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
