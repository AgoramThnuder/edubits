import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import NotebookPreview from "@/components/landing/NotebookPreview";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <NotebookPreview />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
