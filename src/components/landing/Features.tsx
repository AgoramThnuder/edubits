import { motion } from "framer-motion";
import { Brain, MessageCircleQuestion, BarChart3, FileText, Lightbulb, Share2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Course Generation",
    description: "Enter any topic and difficulty. EduBits creates a complete mini-course with modules, lessons, and examples.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Context-Aware Doubts",
    description: "Stuck on a concept? Ask a question right where you are. The AI knows exactly what you're studying.",
  },
  {
    icon: Lightbulb,
    title: "Visual Learning",
    description: "Complex concepts come with auto-generated diagrams. Click on any diagram to get a deeper explanation.",
  },
  {
    icon: FileText,
    title: "Smart Assignments",
    description: "Test your understanding with auto-evaluated quizzes. MCQs, short answers, and application questions.",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    description: "See exactly where you're strong and where you need more practice. Topic by topic, subtopic by subtopic.",
  },
  {
    icon: Share2,
    title: "Share & Export",
    description: "Generate read-only links or export beautiful notebook-style PDFs of your courses and notes.",
  },
];

const Features = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Learning that adapts to you
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to reduce cognitive load and help you focus on what matters: understanding.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-background hover:shadow-card transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-200">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
