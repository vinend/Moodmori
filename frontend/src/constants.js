// API URL for backend services
export const API_URL = 'http://localhost:3000';

// Set this to false to use actual database data
export const DEMO_MODE = true;

// Demo data for offline testing
export const DEMO_DATA = {
  moods: [
    { id: 1, mood_name: 'HAPPY' },
    { id: 2, mood_name: 'SAD' },
    { id: 3, mood_name: 'ANGRY' },
    { id: 4, mood_name: 'AFRAID' },
    { id: 5, mood_name: 'NEUTRAL' },
    { id: 6, mood_name: 'MANIC' },
    { id: 7, mood_name: 'DEPRESSED' },
    { id: 8, mood_name: 'FURIOUS' },
    { id: 9, mood_name: 'TERRIFIED' },
    { id: 10, mood_name: 'CALM' }
  ],
  moodLogs: [
    {
      id: 1,
      user_id: 1,
      mood_id: 1,
      mood_name: 'HAPPY',
      note: 'Had a great day!',
      log_date: '2025-05-02',
      is_favorite: true
    },
    {
      id: 2,
      user_id: 1,
      mood_id: 5,
      mood_name: 'NEUTRAL',
      note: 'Just an ordinary day',
      log_date: '2025-05-01',
      is_favorite: false
    },
    {
      id: 3,
      user_id: 1,
      mood_id: 2,
      mood_name: 'SAD',
      note: 'Feeling a bit down today',
      log_date: '2025-04-30',
      is_favorite: false
    }
  ],
  stats: [
    { mood_id: 1, mood_name: 'HAPPY', count: '10' },
    { mood_id: 2, mood_name: 'SAD', count: '5' },
    { mood_id: 5, mood_name: 'NEUTRAL', count: '7' },
    { mood_id: 3, mood_name: 'ANGRY', count: '3' }
  ],
  favorites: [
    {
      id: 1,
      user_id: 1,
      mood_id: 1,
      mood_name: 'HAPPY',
      note: 'Had a great day!',
      log_date: '2025-05-02',
      is_favorite: true
    }
  ]
};