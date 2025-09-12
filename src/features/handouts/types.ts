export type Handout = {
  id: string;
  slug: string;
  title: string;
  sections: {
    title: string;
    bullets: string[];
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lang: 'sv' | 'en';
  shareToken?: string;
}