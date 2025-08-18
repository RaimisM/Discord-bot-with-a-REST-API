import generateMessage from '../generator'

describe('generateMessage', () => {
  test('should create message with user mention and sprint topic', async () => {
    const options = {
      template: '{username} completed sprint: {topic}',
      user: { id: '123', username: 'Tom' },
      sprintTopic: 'Python testing',
    }

    const result = await generateMessage(options)
    expect(result).toBe('<@123> completed sprint: Python testing')
  })

  test('should replace only known placeholders and leave unknown ones intact', async () => {
    const options = {
      template: '{username} started sprint {topic} with {unknown}',
      user: { id: '456', username: 'Jerry' },
      sprintTopic: 'Node.js',
    }

    const result = await generateMessage(options)
    expect(result).toBe('<@456> started sprint Node.js with {unknown}')
  })

  test('should handle templates without any placeholders', async () => {
    const options = {
      template: 'No placeholders here!',
      user: { id: '789', username: 'Alice' },
      sprintTopic: 'Some sprint',
    }

    const result = await generateMessage(options)
    expect(result).toBe('No placeholders here!')
  })

  test('should handle repeated placeholders correctly', async () => {
    const options = {
      template: '{username} and again {username} are working on {topic}',
      user: { id: '321', username: 'Eve' },
      sprintTopic: 'Refactoring',
    }

    const result = await generateMessage(options)
    expect(result).toBe('<@321> and again <@321> are working on Refactoring')
  })

  test('should return empty string if template is empty', async () => {
    const options = {
      template: '',
      user: { id: '654', username: 'Bob' },
      sprintTopic: 'Code',
    }

    const result = await generateMessage(options)
    expect(result).toBe('')
  })

  test('should leave malformed placeholders untouched', async () => {
    const options = {
      template: '{username started sprint on {topic}}',
      user: { id: '111', username: 'Charlie' },
      sprintTopic: 'Python',
    }

    const result = await generateMessage(options)
    expect(result).toBe('{username started sprint on {topic}}')
  })
})
