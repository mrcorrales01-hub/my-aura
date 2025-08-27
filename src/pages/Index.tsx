import { Heart, Music, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * This component defines a polished landing page for the Aura application.
 * It introduces visitors to the core features of the app and provides
 * clear calls‑to‑action. The layout is fully responsive and
 * emphasizes visual hierarchy and readability. Animations are added
 * via Framer Motion to gently draw attention to key elements without
 * being distracting.
 */
export default function ImprovedIndex() {
  const navigate = useNavigate();

  /**
   * Each feature card is defined by a title, description, and an icon
   * component. The icon is rendered dynamically to allow easy
   * substitution or extension of the feature list in the future.
   */
  const features = [
    {
      title: "Humörloggning",
      description:
        "Logga ditt humör dagligen för att se mönster och få personliga insikter.",
      icon: Heart,
    },
    {
      title: "Guidad meditation",
      description:
        "Utforska ett bibliotek med meditationer som hjälper dig att hitta fokus och lugn.",
      icon: Music,
    },
    {
      title: "Gemenskap",
      description:
        "Anslut med likasinnade användare och dela dina framsteg i vår stödjande community.",
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative flex items-center justify-center h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center max-w-2xl px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">
            Välkommen till Aura
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Din partner för bättre mental hälsa genom daglig reflektions‑
            spårning, guidad meditation och stödjande gemenskap.
          </p>
          <Button
            variant="secondary"
            className="mt-8 px-6 py-3 text-lg"
            onClick={() => navigate("/register")}
          >
            Kom igång gratis
          </Button>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-semibold text-center mb-12"
          >
            Utforska funktionerna
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-col items-center text-center">
                    <feature.icon className="h-12 w-12 text-indigo-500" />
                    <CardTitle className="mt-4 text-xl font-medium">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed text-center">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <img
              src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Person mediterar"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              Bättre balans börjar här
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Aura är designad för att hjälpa dig förstå dina känslor och
              hantera stress. Med våra verktyg kan du reflektera över
              ditt välmående, hitta övningar som passar dig och uppleva
              stöd från en varm community av användare som går igenom
              liknande resor.
            </p>
            <Button
              variant="outline"
              className="px-5 py-2"
              onClick={() => navigate("/about")}
            >
              Läs mer om Aura
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h4 className="text-3xl font-bold mb-4">
            Börja din resa mot ett lugnare sinne idag
          </h4>
          <p className="mb-8 text-lg text-indigo-200">
            Registrera dig för att få tillgång till vår fulla verktygslåda och
            upptäck hur Aura kan hjälpa dig att hitta balans.
          </p>
          <Button
            variant="secondary"
            className="px-6 py-3 text-lg"
            onClick={() => navigate("/register")}
          >
            Skapa konto
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
