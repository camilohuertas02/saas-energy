import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
  // Cuando el usuario haga login o vaya a /dashboard,
  // el servidor lo redirigirá instantáneamente a Análisis.
  redirect('/dashboard/analytics');
}
