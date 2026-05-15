export type WorkerRank = {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  label: string
  emoji: string
  rating: string 
}

export function getWorkerRank(completedJobs: number): WorkerRank {
  if (completedJobs >= 50) {
    return {
      tier: 'diamond',
      label: 'Diamond Worker',
      emoji: '💠', // Sleek diamond badge icon
      rating: '★★★★★',
    }
  }

  if (completedJobs >= 21) {
    return {
      tier: 'gold',
      label: 'Gold Worker',
      emoji: '⭐', // Clean gold star badge
      rating: '★★★★',
    }
  }

  if (completedJobs >= 6) {
    return {
      tier: 'silver',
      label: 'Silver Worker',
      emoji: '✨', // Clean silver/sparkle badge
      rating: '★★★',
    }
  }

  return {
    tier: 'bronze',
    label: 'Bronze Worker',
    emoji: '🔸', // Clean bronze/orange badge
    rating: '★★',
  }
}