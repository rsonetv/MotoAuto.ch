import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus, Flag } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="space-y-2">
      <Button className="w-full justify-start">
        <PlusCircle className="w-4 h-4 mr-2" />
        New Listing
      </Button>
      <Button variant="secondary" className="w-full justify-start">
        <UserPlus className="w-4 h-4 mr-2" />
        Add User
      </Button>
      <Button variant="secondary" className="w-full justify-start">
        <Flag className="w-4 h-4 mr-2" />
        View Reports
      </Button>
    </div>
  );
}