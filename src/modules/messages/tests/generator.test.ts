import generateMessage from '../generator'

describe('generateMessage', () => {
  test('Should create message with user and sprint topic', async () => {
    const options = {
      template: '{username} completed sprint: {sprint}',
      user: { id: '123', username: 'Tom' },
      sprintName: 'Python testing',
    }

    const result = await generateMessage(options)

    expect(result).toBe('<@123> completed sprint: Python testing')
  })

  test('Should replace only defined placeholders', async () => {
    const options = {
      template: '{username} did something',
      user: { id: '456', username: 'Jerry' },
      sprintName: '',
    }

    const result = await generateMessage(options)

    expect(result).toBe('<@456> did something')
  })

  test('Should handle templates without placeholders', async () => {
    const options = {
      template: 'No placeholders here!',
      user: { id: '789', username: 'Alice' },
      sprintName: 'Some sprint',
    }

    const result = await generateMessage(options)

    expect(result).toBe('No placeholders here!')
  })
})
