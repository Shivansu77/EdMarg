import { redirect } from 'next/navigation';

export default function MentorHistoryPage() {
  redirect('/mentor/requests?tab=past');
}
