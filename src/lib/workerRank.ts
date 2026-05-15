export type WorkerRank = {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  label: string
  emoji: string
  ratingValue: number
  ratingText: string
}

export function getWorkerRank(completedJobs: number): WorkerRank {
  if (completedJobs >= 50) {
    return {
      tier: 'diamond',
      label: 'Diamond Worker',
      emoji: '💎',
      ratingValue: 5,
      ratingText: '★★★★★',
    }
  }

  if (completedJobs >= 21) {
    return {
      tier: 'gold',
      label: 'Gold Worker',
      emoji: '🥇',
      ratingValue: 4,
      ratingText: '★★★★',
    }
  }

  if (completedJobs >= 6) {
    return {
      tier: 'silver',
      label: 'Silver Worker',
      emoji: '🥈',
      ratingValue: 3,
      ratingText: '★★★',
    }
  }

  return {
    tier: 'bronze',
    label: 'Bronze Worker',
    emoji: '🥉',
    ratingValue: 2,
    ratingText: '★★',
  }
}