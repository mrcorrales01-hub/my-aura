import { REQUIRE_SUBSCRIPTION } from './flags';

export async function getSubscriptionStatus() {
  if (!REQUIRE_SUBSCRIPTION) return { active: true, source: 'disabled' as const };
  return { active: true, source: 'stub' as const }; // never block
}