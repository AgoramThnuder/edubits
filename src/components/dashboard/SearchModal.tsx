import { useState, useEffect } from "react";
import { Search, BookOpen, FileText, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for search results
const mockCourses = [
  { id: 1, title: "Introduction to Machine Learning", type: "course", progress: 45 },
  { id: 2, title: "Advanced React Patterns", type: "course", progress: 78 },
  { id: 3, title: "Data Structures & Algorithms", type: "course", progress: 23 },
  { id: 4, title: "UI/UX Design Fundamentals", type: "course", progress: 90 },
];

const mockTopics = [
  { id: 1, title: "Neural Networks", type: "topic" },
  { id: 2, title: "React Hooks", type: "topic" },
  { id: 3, title: "Binary Trees", type: "topic" },
];

const recentSearches = ["Machine Learning", "React", "Python"];

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ courses: typeof mockCourses; topics: typeof mockTopics }>({
    courses: [],
    topics: [],
  });

  useEffect(() => {
    if (query.trim()) {
      const filteredCourses = mockCourses.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      );
      const filteredTopics = mockTopics.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults({ courses: filteredCourses, topics: filteredTopics });
    } else {
      setResults({ courses: [], topics: [] });
    }
  }, [query]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border pr-12">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search courses, topics, lessons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground h-8"
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4">
          {!query && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && results.courses.length === 0 && results.topics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {results.courses.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Courses</h4>
              <div className="space-y-1">
                {results.courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    onClick={handleClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Topics</h4>
              <div className="space-y-1">
                {results.topics.map((topic) => (
                  <button
                    key={topic.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors w-full text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <p className="font-medium text-foreground">{topic.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
