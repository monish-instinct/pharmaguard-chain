import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <p className="text-7xl font-bold tracking-tight text-foreground/10">404</p>
        <h1 className="text-xl font-semibold text-foreground mt-4">Page not found</h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-xs mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="outline" className="rounded-full h-10 px-5 text-[13px] font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  );
}
