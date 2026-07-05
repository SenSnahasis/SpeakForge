// 30 rotating storytelling prompts — one per calendar day-of-month, cycling.
export const STORYTELLING_PROMPTS = [
  'Describe your morning routine from waking up to leaving the house.',
  'Tell a story about a memorable trip you took with your family.',
  'Talk about a person who has inspired you and explain why.',
  'Describe your dream job and what makes it appealing to you.',
  'Tell a story about a time you overcame a difficult challenge.',
  'Describe your hometown to someone who has never visited.',
  'Talk about your favorite festival and how you celebrate it.',
  'Tell a story about a mistake you made and what you learned from it.',
  'Describe your best friend and how you both met.',
  'Talk about a skill you want to learn this year and why.',
  'Tell a story about a surprising or unexpected event in your life.',
  'Describe your favorite meal and how it is prepared.',
  'Talk about a book or movie that changed how you think.',
  'Describe a typical weekend in your life.',
  'Tell a story about helping someone in need.',
  'Talk about your favorite season and what you enjoy doing in it.',
  'Describe a goal you achieved that you are proud of.',
  'Tell a story about your first day at a new school or job.',
  'Talk about a habit you are trying to build or break.',
  'Describe the city you would love to live in and why.',
  'Tell a story about a time you had to speak in public.',
  'Talk about how technology has changed your daily life.',
  'Describe a family tradition that is important to you.',
  'Tell a story about a time you felt really proud of yourself.',
  'Talk about a hobby you enjoy and how you got started.',
  'Describe your plans for the next five years.',
  'Tell a story about a difficult decision you had to make.',
  'Talk about someone who taught you an important life lesson.',
  'Describe a place you would love to visit someday and why.',
  'Tell a story about a time things did not go as planned, but it worked out.',
]

export function getPromptForDay(dayIndex) {
  return STORYTELLING_PROMPTS[dayIndex % STORYTELLING_PROMPTS.length]
}
