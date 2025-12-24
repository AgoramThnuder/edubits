import { motion } from "framer-motion";

const NotebookPreview = () => {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Like studying from a well-organized notebook
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clean, calm, and distraction-free. Every lesson feels like turning a page in your favorite notebook.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Notebook mockup */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
            {/* Notebook header */}
            <div className="bg-card px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Introduction to Machine Learning — Lesson 2.1
              </span>
            </div>

            {/* Notebook content */}
            <div className="notebook-paper min-h-[400px] p-0">
              <div className="notebook-block py-8">
                <h3 className="text-2xl font-display font-semibold text-foreground mb-4">
                  What is Supervised Learning?
                </h3>
                <p className="text-foreground/90 leading-loose mb-6">
                  Supervised learning is a type of machine learning where the algorithm learns from 
                  <span className="text-highlight font-medium"> labeled training data</span>. The goal is to learn a mapping 
                  from inputs to outputs based on example input-output pairs.
                </p>

                <div className="bg-accent/40 rounded-lg p-4 mb-6 border-l-4 border-primary">
                  <p className="text-sm font-medium text-foreground mb-1">💡 Key Insight</p>
                  <p className="text-sm text-muted-foreground">
                    Think of it like learning with a teacher who tells you the right answers during practice.
                  </p>
                </div>

                <h4 className="text-lg font-display font-medium text-foreground mb-3">
                  Common Examples
                </h4>
                <ul className="space-y-2 text-foreground/90">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Email spam detection</strong> — Classify emails as spam or not spam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>House price prediction</strong> — Predict price based on features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Medical diagnosis</strong> — Predict disease from symptoms</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Floating chatbot hint */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="absolute bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2"
            >
              <span>Have a doubt?</span>
              <span className="text-lg">💬</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NotebookPreview;
