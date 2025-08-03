import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MoodTracker from "@/components/MoodTracker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <MoodTracker />
      <Features />
    </div>
  );
};

export default Index;
