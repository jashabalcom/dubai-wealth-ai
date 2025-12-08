import { EventsTab } from '@/components/community/EventsTab';
import { PageTransition } from '@/components/community/PageTransition';

export default function EventsPage() {
  return (
    <PageTransition>
      <EventsTab />
    </PageTransition>
  );
}
