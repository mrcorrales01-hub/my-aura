import { useParams, Link } from 'react-router-dom';
import { STORIES } from './storiesData';
import { MD } from './md';
import { useEffect } from 'react';

export default function StoryPage() {
  const { slug } = useParams();
  const s = STORIES.find(x => x.slug === slug);
  
  useEffect(() => {
    if (s) document.title = `${s.title} – My Aura`;
  }, [s]);

  if (!s) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">404</h1>
          <p className="text-sm opacity-70 mb-4">Artikeln hittades inte</p>
          <Link to="/stories" className="text-sm underline">← Till artiklar</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto p-4 space-y-3">
      <Link to="/stories" className="text-sm underline opacity-70 hover:opacity-100">
        ← Till artiklar
      </Link>
      <h1 className="text-3xl font-semibold">{s.title}</h1>
      <div className="text-sm opacity-60">
        {new Date(s.date).toLocaleDateString()} • {s.minutes} min
      </div>
      {s.hero ? (
        <img 
          src={s.hero} 
          alt="" 
          className="rounded-xl border w-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <MD text={s.body} />
      
      <div className="pt-6 border-t mt-8">
        <Link to="/stories" className="text-sm underline opacity-70 hover:opacity-100">
          ← Alla artiklar
        </Link>
      </div>
    </article>
  );
}
