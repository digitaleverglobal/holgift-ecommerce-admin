// Claims made before the rename still store the old wall watch name.
const LEGACY_PRIZE_NAMES = { 'Big Size Wall Watch': 'Luxury Wall Watch' };

// Every prize on a card, by its current name. A card can hold the same prize twice.
export function cardPrizes(card) {
  const names = card.prizes?.length ? card.prizes : [card.prize];
  return names.filter(Boolean).map((name) => LEGACY_PRIZE_NAMES[name] || name);
}
