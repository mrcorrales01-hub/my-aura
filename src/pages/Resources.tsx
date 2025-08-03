import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Search, 
  Heart, 
  MessageCircle, 
  Shield, 
  Zap,
  Users,
  Brain
} from "lucide-react";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: 'anxiety', name: 'Ångest', icon: Brain, color: 'bg-calm' },
    { id: 'selfesteem', name: 'Självkänsla', icon: Zap, color: 'bg-coral' },
    { id: 'communication', name: 'Kommunikation', icon: MessageCircle, color: 'bg-wellness-primary' },
    { id: 'trust', name: 'Tillit', icon: Shield, color: 'bg-lavender' },
    { id: 'conflict', name: 'Konflikter', icon: Users, color: 'bg-wellness-secondary' }
  ];

  const resources = [
    {
      id: 1,
      title: "Andningsteknik för ångest",
      description: "Lär dig 4-7-8 andningen som lugnar nervsystemet på bara 2 minuter",
      type: "video",
      duration: "2 min",
      category: "anxiety",
      content: "Deep breathing exercise that helps calm anxiety..."
    },
    {
      id: 2,
      title: "Sätta gränser utan skuld",
      description: "Praktiska fraser för att säga nej på ett vänligt men bestämt sätt",
      type: "article",
      duration: "3 min läsning",
      category: "communication",
      content: "Learning to set boundaries is crucial for healthy relationships..."
    },
    {
      id: 3,
      title: "Självkänsla-övning: Tacksamhetsdagbok",
      description: "En enkel daglig övning för att bygga upp din självkänsla steg för steg",
      type: "exercise",
      duration: "5 min/dag",
      category: "selfesteem",
      content: "Write down three things you're grateful for each day..."
    },
    {
      id: 4,
      title: "Hantera gräl konstruktivt",
      description: "Tekniker för att förvandla konflikter till möjligheter för närhet",
      type: "article",
      duration: "4 min läsning",
      category: "conflict",
      content: "Conflicts are normal in relationships. Here's how to handle them..."
    },
    {
      id: 5,
      title: "Återbygga tillit efter svek",
      description: "Steg-för-steg guide för att reparera skadad tillit i relationer",
      type: "video",
      duration: "6 min",
      category: "trust",
      content: "Trust can be rebuilt with patience and consistent actions..."
    },
    {
      id: 6,
      title: "Aktivt lyssnande",
      description: "Lär dig att lyssna på ett sätt som får andra att känna sig hörda och förstådda",
      type: "exercise",
      duration: "Praktisk övning",
      category: "communication",
      content: "Active listening involves more than just hearing words..."
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedResource, setSelectedResource] = useState<typeof resources[0] | null>(null);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'exercise': return <Heart className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-coral text-white';
      case 'article': return 'bg-calm text-white';
      case 'exercise': return 'bg-wellness-primary text-white';
      default: return 'bg-muted';
    }
  };

  if (selectedResource) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => setSelectedResource(null)}
          className="mb-6"
        >
          ← Tillbaka till resurser
        </Button>
        
        <Card className="p-8 bg-card/90 backdrop-blur-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${getTypeColor(selectedResource.type)}`}>
              {getTypeIcon(selectedResource.type)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {selectedResource.title}
              </h1>
              <p className="text-lg text-foreground/70 mb-4">
                {selectedResource.description}
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedResource.duration}
                </Badge>
                <Badge variant="outline">
                  {categories.find(c => c.id === selectedResource.category)?.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-wellness-primary/5 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Innehåll</h2>
            <p className="text-foreground/80 leading-relaxed">
              {selectedResource.content}
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="wellness" size="lg">
              Markera som klar
            </Button>
            <Button variant="outline" size="lg">
              Spara för senare
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-wellness-primary" />
          <h1 className="text-3xl font-bold text-foreground">Självhjälpsresurser</h1>
        </div>
        <p className="text-lg text-foreground/70">
          Praktiska verktyg och övningar för ditt välbefinnande
        </p>
      </div>

      {/* Search */}
      <Card className="p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sök efter ämne, teknik eller känslor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger 
            value="all" 
            onClick={() => setSelectedCategory("all")}
          >
            Alla
          </TabsTrigger>
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden md:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card 
                key={resource.id}
                className="p-6 hover:shadow-wellness transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setSelectedResource(resource)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(resource.type)} group-hover:animate-wellness-glow`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {categories.find(c => c.id === resource.category)?.name}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-2">
                      {resource.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </div>
                  <Button variant="ghost" size="sm" className="text-wellness-primary hover:text-wellness-primary/80">
                    Läs mer →
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Inga resurser hittades
              </h3>
              <p className="text-foreground/70">
                Prova att söka på andra termer eller välj en annan kategori.
              </p>
            </Card>
          )}
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.filter(r => r.category === category.id).map((resource) => (
                <Card 
                  key={resource.id}
                  className="p-6 hover:shadow-wellness transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  {/* Same card content as above */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(resource.type)}`}>
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {resource.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </div>
                    <Button variant="ghost" size="sm" className="text-wellness-primary">
                      Läs mer →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Resources;