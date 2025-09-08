-- Create exercises table if not exists
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_sessions table if not exists
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercises - readable by all
CREATE POLICY "Exercises are viewable by everyone" 
ON public.exercises 
FOR SELECT 
USING (true);

-- RLS policies for exercise_sessions - users can manage their own sessions
CREATE POLICY "Users can view their own exercise sessions" 
ON public.exercise_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise sessions" 
ON public.exercise_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise sessions" 
ON public.exercise_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise sessions" 
ON public.exercise_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Seed exercises if table is empty
INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'box-breathing',
  '{"sv":"Boxandning","en":"Box Breathing","es":"Respiración en Caja","no":"Boksepust","da":"Kasse Vejrtrækning","fi":"Laatikko Hengitys"}'::jsonb,
  '{"sv":"Andas in 4 sek, håll 4 sek, andas ut 4 sek, håll 4 sek. Upprepa 3-5 gånger för att lugna nerverna.","en":"Breathe in for 4 sec, hold 4 sec, breathe out 4 sec, hold 4 sec. Repeat 3-5 times to calm nerves.","es":"Inhala 4 seg, mantén 4 seg, exhala 4 seg, mantén 4 seg. Repite 3-5 veces para calmar nervios.","no":"Pust inn i 4 sek, hold i 4 sek, pust ut i 4 sek, hold i 4 sek. Gjenta 3-5 ganger for å roe nervene.","da":"Indånding 4 sek, hold 4 sek, udånding 4 sek, hold 4 sek. Gentag 3-5 gange for at berolige nerverne.","fi":"Hengitä sisään 4 sek, pidätä 4 sek, hengitä ulos 4 sek, pidätä 4 sek. Toista 3-5 kertaa rauhoittaaksesi hermot."}'::jsonb,
  120,
  '{"breathing","anxious","stressed"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'box-breathing');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'grounding-5-4-3-2-1',
  '{"sv":"Jordning 5-4-3-2-1","en":"Grounding 5-4-3-2-1","es":"Técnica 5-4-3-2-1","no":"Grounding 5-4-3-2-1","da":"Grounding 5-4-3-2-1","fi":"Maadoitus 5-4-3-2-1"}'::jsonb,
  '{"sv":"Hitta 5 saker du ser, 4 du hör, 3 du känner, 2 du luktar, 1 du smakar. Hjälper vid oro och ångest.","en":"Find 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste. Helps with anxiety and overwhelm.","es":"Encuentra 5 cosas que ves, 4 que oyes, 3 que sientes, 2 que hueles, 1 que saboreas. Ayuda con ansiedad.","no":"Finn 5 ting du ser, 4 du hører, 3 du føler, 2 du lukter, 1 du smaker. Hjelper mot angst og stress.","da":"Find 5 ting du ser, 4 du hører, 3 du føler, 2 du lugter, 1 du smager. Hjælper mod angst og overvældelse.","fi":"Löydä 5 asiaa joita näet, 4 joita kuulet, 3 joita tunnet, 2 joita haistelet, 1 jonka maistat. Auttaa ahdistukseen."}'::jsonb,
  180,
  '{"grounding","anxious","overwhelm"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'grounding-5-4-3-2-1');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'coherent-breathing',
  '{"sv":"Sammanhängande andning","en":"Coherent Breathing","es":"Respiración Coherente","no":"Sammenhengende pust","da":"Sammenhængende vejrtrækning","fi":"Yhtenäinen hengitys"}'::jsonb,
  '{"sv":"Andas in 5 sekunder, andas ut 5 sekunder. Skapa en lugn, jämn rytm som balanserar ditt nervSystem.","en":"Breathe in for 5 seconds, breathe out for 5 seconds. Create a calm, even rhythm that balances your nervous system.","es":"Inhala 5 segundos, exhala 5 segundos. Crea un ritmo calmado que equilibra tu sistema nervioso.","no":"Pust inn i 5 sekunder, pust ut i 5 sekunder. Skape en rolig, jevn rytme som balanserer nervesystemet.","da":"Indånd i 5 sekunder, udånd i 5 sekunder. Skab en rolig rytme der balancerer dit nervesystem.","fi":"Hengitä sisään 5 sekuntia, hengitä ulos 5 sekuntia. Luo rauhallinen rytmi joka tasapainottaa hermostosi."}'::jsonb,
  180,
  '{"breathing","calm"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'coherent-breathing');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'progressive-muscle-relaxation',
  '{"sv":"Progressiv muskelavslappning","en":"Progressive Muscle Relaxation","es":"Relajación Muscular Progresiva","no":"Progressiv muskelavspenning","da":"Progressiv muskelafslapning","fi":"Progressiivinen lihasrentoutus"}'::jsonb,
  '{"sv":"Spän axlarna i 5 sek, slappna av. Gör samma med käke, händer och fötter. Hjälper mot spänningar.","en":"Tense shoulders for 5 sec, then relax. Do the same with jaw, hands and feet. Helps release tension.","es":"Tensa hombros 5 seg, luego relaja. Haz lo mismo con mandíbula, manos y pies. Libera tensión.","no":"Stram skuldrene i 5 sek, så slapp av. Gjør det samme med kjeve, hender og føtter. Hjelper mot spenning.","da":"Spænd skuldrene i 5 sek, så slap af. Gør det samme med kæbe, hænder og fødder. Hjælper mod spændinger.","fi":"Jännittä hartiat 5 sek, sitten rentouta. Tee samoin leualle, käsille ja jaloille. Auttaa jännitysten poistoon."}'::jsonb,
  210,
  '{"body","tension","stressed"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'progressive-muscle-relaxation');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'micro-stretch',
  '{"sv":"Mikrosträckning","en":"Micro Stretch","es":"Micro Estiramiento","no":"Mikro-tøying","da":"Mikro-stræk","fi":"Mikrovenyttely"}'::jsonb,
  '{"sv":"Rulla axlarna bakåt 5 gånger. Böj huvudet åt sidan och håll 10 sek. Rotera handleder. Perfekt vid datorarbete.","en":"Roll shoulders back 5 times. Tilt head to side and hold 10 sec. Rotate wrists. Perfect for computer work.","es":"Rueda hombros hacia atrás 5 veces. Inclina cabeza a un lado y mantén 10 seg. Rota muñecas.","no":"Rull skuldrene bakover 5 ganger. Bøy hodet til siden og hold i 10 sek. Roter håndledd.","da":"Rul skuldrene bagud 5 gange. Bøj hovedet til siden og hold i 10 sek. Roter håndled.","fi":"Pyöritä hartiat taaksepäin 5 kertaa. Kallista päätä sivulle ja pidä 10 sek. Pyöritä ranteita."}'::jsonb,
  120,
  '{"micro-move","tension"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'micro-stretch');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'eye-break',
  '{"sv":"Ögonpaus","en":"Eye Break","es":"Descanso Visual","no":"Øyepause","da":"Øjenpause","fi":"Silmätauko"}'::jsonb,
  '{"sv":"Titta bort från skärmen. Fokusera på något 6 meter bort i 20 sek. Blinka medvetet 10 gånger.","en":"Look away from screen. Focus on something 20 feet away for 20 sec. Blink consciously 10 times.","es":"Mira lejos de la pantalla. Enfoca algo a 6 metros por 20 seg. Parpadea conscientemente 10 veces.","no":"Se bort fra skjermen. Fokuser på noe 6 meter unna i 20 sek. Blink bevisst 10 ganger.","da":"Se væk fra skærmen. Fokuser på noget 6 meter væk i 20 sek. Blink bevidst 10 gange.","fi":"Katso pois näytöltä. Keskity johonkin 6 metrin päässä 20 sek. Räpyttele silmiä tietoisesti 10 kertaa."}'::jsonb,
  90,
  '{"micro-move","focus"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'eye-break');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'name-the-feeling',
  '{"sv":"Namnge känslan","en":"Name the Feeling","es":"Nombra el Sentimiento","no":"Navngi følelsen","da":"Navngiv følelsen","fi":"Nimeä tunne"}'::jsonb,
  '{"sv":"Stanna upp och fråga: \\\"Vad känner jag just nu?\\\". Namnge känslan utan att bedöma. Acceptera den som den är.","en":"Pause and ask: \\\"What am I feeling right now?\\\". Name the feeling without judgment. Accept it as it is.","es":"Pausa y pregúntate: \\\"¿Qué siento ahora?\\\". Nombra el sentimiento sin juzgar. Acéptalo como es.","no":"Stopp opp og spør: \\\"Hva føler jeg akkurat nå?\\\". Navngi følelsen uten å dømme. Aksepter den som den er.","da":"Stop op og spørg: \\\"Hvad føler jeg lige nu?\\\". Navngiv følelsen uden at dømme. Accepter den som den er.","fi":"Pysähdy ja kysy: \\\"Mitä tunnen juuri nyt?\\\". Nimeä tunne tuomitsematta. Hyväksy se sellaisena kuin se on."}'::jsonb,
  90,
  '{"labeling","reflect","sad"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'name-the-feeling');

INSERT INTO public.exercises (slug, title, description, duration_seconds, tags)
SELECT 
  'gratitude-3x',
  '{"sv":"Tacksamhet 3x","en":"Gratitude 3x","es":"Gratitud 3x","no":"Takknemlighet 3x","da":"Taknemmelighed 3x","fi":"Kiitollisuus 3x"}'::jsonb,
  '{"sv":"Tänk på 3 saker du är tacksam för idag. Små eller stora. Känn tacksamheten i kroppen.","en":"Think of 3 things you are grateful for today. Small or big. Feel the gratitude in your body.","es":"Piensa en 3 cosas por las que estás agradecido hoy. Pequeñas o grandes. Siente la gratitud en tu cuerpo.","no":"Tenk på 3 ting du er takknemlig for i dag. Små eller store. Kjenn takknemligheten i kroppen.","da":"Tænk på 3 ting du er taknemmelig for i dag. Små eller store. Mærk taknemmeligheden i kroppen.","fi":"Ajattele 3 asiaa joista olet kiitollinen tänään. Pieniä tai suuria. Tunne kiitollisuus kehossasi."}'::jsonb,
  120,
  '{"gratitude","calm"}'
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE slug = 'gratitude-3x');