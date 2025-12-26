import { Brain, Code, History, Calculator, TrendingUp } from "lucide-react";

// Last 7 days study data - sorted by hours (most studied first)
const weeklyTopics = [
  { icon: Brain, name: "Machine Learning", lessonsCompleted: 8, hoursStudied: 12.5, color: "bg-accent/10 text-accent" },
  { icon: Code, name: "Python Basics", lessonsCompleted: 6, hoursStudied: 8.3, color: "bg-primary/10 text-primary" },
  { icon: Calculator, name: "Statistics", lessonsCompleted: 4, hoursStudied: 5.2, color: "bg-warning/10 text-warning" },
  { icon: History, name: "World History", lessonsCompleted: 3, hoursStudied: 3.8, color: "bg-success/10 text-success" },
].sort((a, b) => b.hoursStudied - a.hoursStudied);

const TopicsList = () => {
  const totalHours = weeklyTopics.reduce((sum, topic) => sum + topic.hoursStudied, 0);

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Most Studied</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Last 7 days</span>
      </div>

      <div className="space-y-3">
        {weeklyTopics.map((topic, index) => (
          <div 
            key={topic.name}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.color}`}>
              <topic.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{topic.name}</p>
              <p className="text-xs text-muted-foreground">{topic.lessonsCompleted} lessons completed</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-foreground">{topic.hoursStudied}</span>
                <span className="text-sm text-muted-foreground">hrs</span>
              </div>
              {index === 0 && (
                <div className="flex items-center gap-1 text-xs text-accent">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total this week</span>
          <span className="font-semibold text-foreground">{totalHours.toFixed(1)} hours</span>
        </div>
      </div>
    </div>
  );
};

export default TopicsList;
