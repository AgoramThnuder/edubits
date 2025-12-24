import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Ready to learn differently?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start with any topic you're curious about. EduBits will guide you through it, 
            step by step, at your own pace.
          </p>

          <Button asChild variant="calm" size="xl">
            <Link to="/dashboard">
              <BookOpen className="w-5 h-5" />
              Create Your First Course
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            No sign-up required to explore. Your learning, your way.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
