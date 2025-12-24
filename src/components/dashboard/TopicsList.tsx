import { Brain, Code, History, Calculator } from "lucide-react";

const topics = [
  { icon: Brain, name: "Machine Learning", lessons: 12, hours: 18.5, color: "bg-accent/10 text-accent" },
  { icon: Code, name: "Python Basics", lessons: 8, hours: 12.2, color: "bg-primary/10 text-primary" },
  { icon: History, name: "World History", lessons: 6, hours: 8.4, color: "bg-success/10 text-success" },
  { icon: Calculator, name: "Statistics", lessons: 4, hours: 5.8, color: "bg-warning/10 text-warning" },
];

const TopicsList = () => {
  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">By topic</h2>

      <div className="space-y-3">
        {topics.map((topic) => (
          <div 
            key={topic.name}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.color}`}>
              <topic.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{topic.lessons} lessons</p>
              <p className="font-medium text-foreground truncate">{topic.name}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-foreground">{topic.hours}</span>
              <span className="text-sm text-muted-foreground">h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicsList;
