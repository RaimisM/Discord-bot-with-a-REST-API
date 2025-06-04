export const users = [
  { id: '1', username: 'Tom' },
  { id: '2', username: 'John' },
];

export const sprints = [
  {
    id: 1,
    sprintName: 'WD-1.1',
    topicName: 'First Steps Into Programming with Python',  // keep as topicName
  },
  {
    id: 2,
    sprintName: 'WD-2.1',
    topicName: 'Second Steps Into Programming with Python',  // keep as topicName
  },
];

export const templates = [
  { id: 1, text: 'congratulations {username} for {sprint}!' },
];

export const messages = [
  {
    gifUrl: 'test url',
    originalMessage: 'congratulations!',
    sprintName: 'WD-1.1',
    sprintId: 1,
    sprintTopic: 'First Steps Into Programming with Python',  // sprintTopic for Messages
    templateId: 1,
    templateText: 'congratulations {username} for {sprint}!',
    username: 'Tom',
  },
];
