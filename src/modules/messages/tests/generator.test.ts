import generateMessage from '../generator'

describe('generateMessage', () => {
  test('Should create message with user and sprint topic', async () => {
    const options = {
      template: '{username} completed sprint: {topic}',
      user: { id: '123', username: 'Tom' },
      sprintTopic: 'Python testing',
    }

    const result = await generateMessage(options)

    expect(result).toBe('<@123> completed sprint: Python testing')
  })

  test('Should replace only defined placeholders', async () => {
    const options = {
      template: '{username} did something',
      user: { id: '456', username: 'Jerry' },
      sprintTopic: '',
    }

    const result = await generateMessage(options)

    expect(result).toBe('<@456> did something')
  })

  test('Should handle templates without placeholders', async () => {
    const options = {
      template: 'No placeholders here!',
      user: { id: '789', username: 'Alice' },
      sprintTopic: 'Some sprint',
    }

    const result = await generateMessage(options)

    expect(result).toBe('No placeholders here!')
  })
})
