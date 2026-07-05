// Real-life question banks used by Scenario Speaking and the AI Speaking Partner.

export const INTERVIEW_QUESTIONS = [
  'Tell me about yourself.',
  'Why do you want to work for this company?',
  'What are your greatest strengths?',
  'What is your biggest weakness?',
  'Where do you see yourself in five years?',
  'Why did you leave your last job?',
  'Describe a challenge you faced at work and how you handled it.',
  'How do you handle stress and pressure?',
  'What motivates you to do your best work?',
  'Tell me about a time you worked in a team.',
  'What makes you a good fit for this role?',
  'How do you prioritize your tasks when you have multiple deadlines?',
  'Describe a time you disagreed with a coworker.',
  'What is your expected salary?',
  'Do you have any questions for us?',
]

export const OFFICE_MEETING_SCENARIOS = [
  {
    id: 'office-1',
    title: 'Starting a Team Meeting',
    context: 'You are leading a Monday morning status meeting with your team.',
    questions: [
      "Good morning everyone, shall we start the meeting?",
      'Can you give a quick update on your current tasks?',
      'Are there any blockers we should discuss today?',
      'What is our plan for the rest of the week?',
    ],
  },
  {
    id: 'office-2',
    title: 'Presenting an Idea',
    context: 'You need to pitch a new idea to your manager and colleagues.',
    questions: [
      'What problem does your idea solve?',
      'How would you implement this idea?',
      'What resources would you need?',
      'What results do you expect from this?',
    ],
  },
  {
    id: 'office-3',
    title: 'Discussing a Deadline',
    context: 'A project deadline is approaching and you need to discuss progress.',
    questions: [
      'How much of the project is completed so far?',
      'Do you think we will meet the deadline?',
      'What support do you need to finish on time?',
      'Should we inform the client about any delay?',
    ],
  },
  {
    id: 'office-4',
    title: 'Giving Feedback',
    context: 'You are giving constructive feedback to a team member.',
    questions: [
      'What do you think went well on this task?',
      'What could be improved next time?',
      'How can I support you going forward?',
      'Do you have any feedback for me as well?',
    ],
  },
  {
    id: 'office-5',
    title: 'Requesting Leave',
    context: 'You need to ask your manager for a few days off.',
    questions: [
      'Could I take three days off next week?',
      'I have a family event, would that be alright?',
      'Who can cover my tasks while I am away?',
      'Should I finish anything before I leave?',
    ],
  },
  {
    id: 'office-6',
    title: 'Client Call',
    context: 'You are on a call with a client to discuss project requirements.',
    questions: [
      'Could you explain your requirements in more detail?',
      'What is your expected timeline for this project?',
      'Do you have a budget range in mind?',
      'When can we schedule the next follow-up call?',
    ],
  },
  {
    id: 'office-7',
    title: 'Onboarding a New Colleague',
    context: 'A new team member just joined and you are showing them around.',
    questions: [
      'Welcome to the team! How was your first day so far?',
      'Let me show you where the meeting rooms are.',
      'Do you have any questions about the tools we use?',
      'Feel free to ask me anything, okay?',
    ],
  },
  {
    id: 'office-8',
    title: 'Handling a Complaint',
    context: 'A colleague raises a concern about workload distribution.',
    questions: [
      'I understand your concern, can you explain more?',
      'How do you think we should redistribute the tasks?',
      'What would make this situation better for you?',
      'Let us find a fair solution together.',
    ],
  },
]

export const DAILY_CONVERSATION_SCENARIOS = [
  {
    id: 'daily-1',
    title: 'Ordering Food at a Restaurant',
    context: 'You are at a restaurant and the waiter comes to take your order.',
    questions: [
      'Good evening, are you ready to order?',
      'What would you like to drink?',
      'Would you like anything else with that?',
      'How would you like your steak cooked?',
    ],
  },
  {
    id: 'daily-2',
    title: 'Asking for Directions',
    context: 'You are lost in a new city and ask a stranger for help.',
    questions: [
      'Excuse me, could you tell me how to get to the train station?',
      'Is it within walking distance from here?',
      'Should I take a bus or a taxi?',
      'Thank you so much for your help.',
    ],
  },
  {
    id: 'daily-3',
    title: 'Shopping for Clothes',
    context: 'You are in a clothing store looking for a jacket.',
    questions: [
      'Do you have this jacket in a medium size?',
      'Can I try this on?',
      'Is there a discount on this item?',
      'Do you accept card payments?',
    ],
  },
  {
    id: 'daily-4',
    title: 'Visiting the Doctor',
    context: 'You are describing your symptoms to a doctor.',
    questions: [
      'What symptoms have you been experiencing?',
      'How long have you had this problem?',
      'Are you currently taking any medicine?',
      'Do you have any allergies I should know about?',
    ],
  },
  {
    id: 'daily-5',
    title: 'Making a Phone Call',
    context: 'You are calling a friend to make weekend plans.',
    questions: [
      'Hey, are you free this weekend?',
      'Do you want to watch a movie or go out to eat?',
      'What time works best for you?',
      'Great, see you then!',
    ],
  },
  {
    id: 'daily-6',
    title: 'Checking into a Hotel',
    context: 'You have just arrived at a hotel and are checking in.',
    questions: [
      'I have a reservation under my name.',
      'What time is checkout?',
      'Does the room include breakfast?',
      'Could I get a room with a better view?',
    ],
  },
  {
    id: 'daily-7',
    title: 'Small Talk with a Neighbor',
    context: 'You run into your neighbor while taking out the trash.',
    questions: [
      'Hi there, how have you been lately?',
      'Did you hear about the new park opening nearby?',
      'How is your family doing?',
      'Let us catch up properly sometime soon.',
    ],
  },
  {
    id: 'daily-8',
    title: 'Returning an Item',
    context: 'You are at customer service to return a defective product.',
    questions: [
      'I would like to return this item, it stopped working.',
      'Do you have the receipt with you?',
      'Would you prefer a refund or an exchange?',
      'How long will the refund take to process?',
    ],
  },
  {
    id: 'daily-9',
    title: 'Talking to a Taxi Driver',
    context: 'You are giving directions to a taxi driver.',
    questions: [
      'Could you take me to the city center, please?',
      'How long will the ride take?',
      'Can you drop me near the main entrance?',
      'How much will the fare be?',
    ],
  },
  {
    id: 'daily-10',
    title: 'Catching Up with an Old Friend',
    context: 'You unexpectedly meet an old friend at a coffee shop.',
    questions: [
      'Wow, I have not seen you in ages, how are you?',
      'What have you been up to these days?',
      'Are you still working at the same company?',
      'We should meet up again soon, right?',
    ],
  },
]

export const SCENARIOS = [
  ...OFFICE_MEETING_SCENARIOS.map((s) => ({ ...s, category: 'Office Meeting' })),
  ...DAILY_CONVERSATION_SCENARIOS.map((s) => ({ ...s, category: 'Daily Conversation' })),
]

export function getScenarioForDay(dayIndex) {
  return SCENARIOS[dayIndex % SCENARIOS.length]
}

export function getInterviewQuestionForDay(dayIndex) {
  return INTERVIEW_QUESTIONS[dayIndex % INTERVIEW_QUESTIONS.length]
}
