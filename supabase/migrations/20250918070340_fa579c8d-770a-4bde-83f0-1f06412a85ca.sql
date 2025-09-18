-- Seed roleplay scripts with Swedish content
INSERT INTO public.roleplay_scripts (slug, title, description, language, steps, is_active)
VALUES
('clinic-anxiety-sv', 'Läkartid: ta upp oro & symtom', 
 'Öva att beskriva symtom kort och tydligt, ställa 2 frågor och be om nästa steg.',
 'sv', 
 jsonb_build_array(
   jsonb_build_object('id',1,'role','system','text','Du övar inför ett läkarbesök. Jag spelar läkaren.'),
   jsonb_build_object('id',2,'role','coach','text','Säg: 1) det viktigaste besväret, 2) hur länge, 3) vad du vill få hjälp med.'),
   jsonb_build_object('id',3,'role','user_prompt','text','Skriv ditt 3-raders intro här…'),
   jsonb_build_object('id',4,'role','coach','text','Bra. Nu 2 frågor du vill få svar på.'),
   jsonb_build_object('id',5,'role','user_prompt','text','Fråga 1 och 2…'),
   jsonb_build_object('id',6,'role','coach','text','Avslut: Be om nästa steg och sammanfatta med 1 mening.')
 ), 
 true),
 
('work-assert-sv', 'Jobb: sätt gräns vänligt',
 'Öva att säga nej/omförhandla uppgift på ett respektfullt sätt.',
 'sv', 
 jsonb_build_array(
   jsonb_build_object('id',1,'role','system','text','Jag spelar kollega/chef.'),
   jsonb_build_object('id',2,'role','coach','text','Börja med uppskattning + tydlig gräns + alternativ.'),
   jsonb_build_object('id',3,'role','user_prompt','text','Skriv din öppning…'),
   jsonb_build_object('id',4,'role','coach','text','Bra. Lägg till ett konkret förslag (tid/omfattning).'),
   jsonb_build_object('id',5,'role','user_prompt','text','Mitt förslag…')
 ), 
 true),
 
('family-boundary-sv', 'Familj: tydlig gräns med värme',
 'Öva ett "vänlig men fast" gränssättningssamtal.',
 'sv', 
 jsonb_build_array(
   jsonb_build_object('id',1,'role','system','text','Jag spelar familjemedlemmen.'),
   jsonb_build_object('id',2,'role','coach','text','Format: Jag-budskap + gräns + behov + nästa steg.'),
   jsonb_build_object('id',3,'role','user_prompt','text','Skriv ditt jag-budskap…')
 ), 
 true)
 
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title, 
  description = EXCLUDED.description, 
  language = EXCLUDED.language, 
  steps = EXCLUDED.steps, 
  is_active = EXCLUDED.is_active;