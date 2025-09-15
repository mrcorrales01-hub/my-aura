-- Seed Swedish roleplay scripts for development
INSERT INTO public.roleplay_scripts (id, slug, title, description, language, steps, is_active, created_at)
VALUES
(gen_random_uuid(), 'sv-samtal-chef', 'Svårt samtal med chef', 'Öva ett respektfullt men tydligt samtal om arbetsbelastning.', 'sv',
 '[
   {"speaker":"auri","text":"Du är stressad av arbetsbelastningen. Börja med en jag-budskap-öppning.","choices":[
     {"label":"Öva öppning","next":1},{"label":"Be om hjälp","next":2}]},
   {"speaker":"you","text":"Jag känner mig överbelastad och vill hitta en hållbar plan.","choices":[
     {"label":"Fortsätt","next":3}]},
   {"speaker":"auri","text":"Bra. Föreslå 1–2 konkreta ändringar för nästa vecka (t.ex. färre möten, prioriteringslista).","choices":[
     {"label":"Föreslå ändringar","next":3}]},
   {"speaker":"auri","text":"Avsluta: sammanfatta, be om återkoppling, boka uppföljning.","choices":[
     {"label":"Klar","next":null}]}
 ]'::jsonb, true, now()),
(gen_random_uuid(), 'sv-konflikt-van', 'Hantera konflikt med vän', 'Träna aktivt lyssnande och gränssättning.', 'sv',
 '[
   {"speaker":"auri","text":"Vad vill du uppnå i samtalet med din vän?","choices":[{"label":"Bestämd men snäll","next":1}]},
   {"speaker":"auri","text":"Spegel: upprepa vännen med egna ord innan du svarar.","choices":[{"label":"Öva spegling","next":2}]},
   {"speaker":"auri","text":"Säg ditt behov i jag-form och föreslå nästa steg.","choices":[{"label":"Formulera behov","next":null}]}
 ]'::jsonb, true, now()),
(gen_random_uuid(), 'sv-vardkontakt', 'Kontakta vården', 'Förbered kort lägesbild och mål inför besök.', 'sv',
 '[
   {"speaker":"auri","text":"Beskriv 1) huvudbesvär 2) hur ofta/hur länge 3) Hur påverkar vardagen?","choices":[{"label":"Svara","next":1}]},
   {"speaker":"auri","text":"Lista 3 frågor du vill få svar på i besöket.","choices":[{"label":"Klart","next":null}]}
 ]'::jsonb, true, now())
ON CONFLICT (slug) DO NOTHING;