import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Subtle notebook lines background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 31px,
              hsl(var(--notebook-line)) 31px,
              hsl(var(--notebook-line)) 32px
            )`,
          }}
        />
      </div>

      {/* Left margin line accent */}
      <div 
        className="absolute left-[10%] top-0 bottom-0 w-px opacity-20"
        style={{ backgroundColor: 'hsl(var(--notebook-margin))' }}
      />

      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/60 text-accent-foreground text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Learning, Thoughtfully Designed</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-tight mb-6 text-balance"
          >
            Learn anything,{" "}
            <span className="text-highlight">one calm step</span>{" "}
            at a time
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            EduBits creates personalized mini-courses that teach you step by step, 
            answer your doubts in context, and show you exactly how to improve.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild variant="calm" size="xl">
              <Link to="/dashboard">
                <BookOpen className="w-5 h-5" />
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute top-20 right-[15%] w-20 h-20 rounded-full bg-accent/40 blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-32 left-[20%] w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        />
      </div>
    </section>
  );
};

export default Hero;
