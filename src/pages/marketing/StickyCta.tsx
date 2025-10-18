import { Link } from 'react-router-dom';

export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-3 z-[90] flex justify-center md:hidden">
      <Link 
        to="/auth" 
        className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        Prova i webben
      </Link>
    </div>
  );
}
