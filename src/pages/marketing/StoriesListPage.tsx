import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORIES } from './storiesData';
import { useTranslation } from 'react-i18next';

export default function StoriesListPage() {
  const { t } = useTranslation('stories');
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | undefined>();
  
  const tags = useMemo(() => Array.from(new Set(STORIES.flatMap(s => s.tags))).sort(), []);
  
  const filtered = STORIES.filter(s => {
    const hitQ = !q || (s.title + ' ' + s.excerpt).toLowerCase().includes(q.toLowerCase());
    const hitT = !tag || s.tags.includes(tag);
    return hitQ && hitT;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-sm opacity-70">{t('subtitle')}</p>
      
      <div className="flex flex-wrap gap-2">
        <input 
          className="border rounded px-3 py-2" 
          placeholder={t('search') || 'Sök'} 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
        <select 
          className="border rounded px-2 py-2" 
          value={tag || ''} 
          onChange={e => setTag(e.target.value || undefined)}
        >
          <option value="">{t('all') || 'Alla taggar'}</option>
          {tags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map(s => (
          <Link 
            to={`/stories/${s.slug}`} 
            key={s.slug} 
            className="rounded-2xl border overflow-hidden hover:shadow-sm transition-shadow"
          >
            <div 
              className="aspect-video bg-gray-100" 
              style={{
                backgroundImage: s.hero ? `url(${s.hero})` : undefined, 
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
            <div className="p-3 space-y-1">
              <div className="text-sm opacity-60">
                {new Date(s.date).toLocaleDateString()}
              </div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm opacity-70">{s.excerpt}</div>
              <div className="text-xs opacity-60">
                {s.minutes} min • {s.tags.join(' • ')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
