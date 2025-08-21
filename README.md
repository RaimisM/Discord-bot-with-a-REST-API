# Discord bot with a REST API

## Setup

**Note:** Before running the project, you need to configure your environment variables.
Use the `.env.example` file as a reference for all required database and bot settings.

### Discord Bot Creation and Required Keys

To run the project successfully, you need a Discord Bot, a channel for the bot to post messages, and a Giphy API key. Follow the steps below:

1. **Create a Discord Account**
   You must have a Discord account. If you don’t, [sign up here](https://discord.com/register).

2. **Create a Discord Bot**
   - Visit the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
   - Add a Bot to the application.
   - (Optional) Follow this [video tutorial](https://youtu.be/Q0JlD7gCZRs?si=7zfC9zj2791Jursq&t=350) from **5:50 to 7:50** to learn how to create a bot.
   - Copy your bot token and add it to the `.env` file as:
     ```env
     DISCORD_TOKEN_ID=your_discord_bot_token
     ```
   - **Important:** Enable the **“Server Members Intent”** (under *Privileged Gateway Intents*) so the bot can function correctly.

3. **Get the Channel ID**
   - Invite your bot to your Discord server.
   - Create a text channel (or use an existing one).
   - Enable **Developer Mode**:
     *Discord App → User Settings → App Settings → Advanced → Enable Developer Mode*.
   - Right-click on the channel and select **Copy Channel ID**.
   - Add it to the `.env` file as:
     ```env
     DISCORD_CHANNEL_ID=your_channel_id
     ```

4. **Get a Giphy API Key**
   - Visit [Giphy Developers](https://developers.giphy.com/).
   - Log in (or create an account) and generate an API key.
   - Add it to the `.env` file as:
     ```env
     GIPHY_API_KEY=your_giphy_api_key
     ```

---

✅ Once you’ve set the following in your `.env` file:
- `DISCORD_TOKEN_ID`
- `DISCORD_CHANNEL_ID`
- `GIPHY_API_KEY`  

You’re ready to proceed with installation and running the project.

## Installation

Install dependencies:

```bash
npm install
```

### Commands

- **Seed the database (templates and sprints):**
  ```bash
  npm run seed
  ```

- **Run the tests:**
  ```bash
  npm run test
  ```

- **Get tests coverage report:**
  ```bash
  npm run coverage
  ```

- **Format the code:**
  ```bash
  npm run format
  ```

- **Lint the code:**
  ```bash
  npm run lint
  ```

- **Migrate database to the latest migration:**
  ```bash
  npm run migrate:latest
  ```

- **Generate database types:**
  ```bash
  npm run gen:types
  ```

- **Migrate database to the latest migration and generate database types:**
  ```bash
  npm run migrate:gen
  ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in development mode |
| `npm run test` | Run tests |
| `npm run coverage` | Generate test coverage report |
| `npm run format` | Format the code |
| `npm run lint` | Lint the code |
| `npm run migrate:latest` | Run latest database migrations |
| `npm run gen:types` | Generate database types |
| `npm run migrate:gen` | Run migrations and generate types together |
| `npm run seed` | Seed the database with templates and sprints |


## Endpoints

### Messages

#### Send Congratulatory Message
**POST** `/messages`

Send a congratulatory message to a user on Discord.

**Request Body:**
```json
{
  "username": "testymctest_82934",
  "sprintCode": "WD-1.1"
}
```

**Notes:**
- `username` must be a valid Discord username from the users table
- `sprintCode` must exist in the sprints table

**Response:**
```json
{
  "id": 1,
  "username": "testymctest_82934",
  "sprintCode": "WD-1.1",
  "sprintId": 3,
  "sprintTopic": "Intro to Web Development",
  "originalMessage": "You nailed it! 💪",
  "templateId": 2,
  "templateText": "You nailed it! 💪",
  "gifUrl": "https://giphy.com/example.gif",
  "createdAt": "2025-08-20T14:00:00.000Z"
}
```

#### Get All Messages
**GET** `/messages`

Retrieve a list of all congratulatory messages.

**Query Parameters:**
- `username` - Filter by username (e.g., `/messages?username=testymctest_82934`)
- `sprintCode` - Filter by sprint code (e.g., `/messages?sprintCode=WD-1.1`)


**Response:**
```json
[
  {
    "id": 1,
    "username": "testymctest_82934",
    "sprintCode": "WD-1.1",
    "sprintId": 3,
    "sprintTopic": "Intro to Web Development",
    "originalMessage": "You nailed it! 💪",
    "templateId": 2,
    "templateText": "You nailed it! 💪",
    "gifUrl": "https://giphy.com/example.gif",
    "createdAt": "2025-08-20T14:00:00.000Z"
  }
]
```

### Templates

#### Create Message Template
**POST** `/templates`

Create a new congratulatory message template.

**Request Body:**
```json
{
  "text": "Congratulations {username} for completing {topic}!"
}
```

**Notes:**
- `{username}` and `{topic}` placeholders should be included in the template text

**Response:**
```json
{
  "id": 4,
  "text": "Congratulations {username} for completing {topic}!"
}
```

#### Get All Templates
**GET** `/templates`

Retrieve all message templates.

**Response:**
```json
[
  {
    "id": 1,
    "text": "You nailed it! 💪"
  },
  {
    "id": 2,
    "text": "You did it! I knew you could. 🤗"
  }
]
```

#### Update Template
**PATCH** `/templates/:id`

Update a specific template.

**Request Body:**
```json
{
  "text": "Way to go, {username}, for completing {sprint}! 🎉"
}
```

**Response:**
```json
{
  "id": 2,
  "text": "Way to go, {username}, for completing {sprint}! 🎉"
}
```

#### Delete Template
**DELETE** `/templates/:id`

Delete a specific template.

**Response:**
```json
{
  "message": "Template deleted successfully"
}
```

### Sprints

#### Create Sprint
**POST** `/sprints`

Create a new sprint.

**Request Body:**
```json
{
  "sprintCode": "WD-3-3",
  "topicName": "Advanced Frontend Development"
}
```

**Response:**
```json
{
  "id": 10,
  "sprintCode": "WD-3-3",
  "topicName": "Advanced Frontend Development"
}
```

#### Get All Sprints
**GET** `/sprints`

Retrieve all sprints.

**Response:**
```json
[
  {
    "id": 1,
    "sprintCode": "WD-1-1",
    "topicName": "First Steps Into Programming with Python"
  },
  {
    "id": 2,
    "sprintCode": "WD-1-2",
    "topicName": "Intermediate Programming with Python"
  },
  {
    "id": 3,
    "sprintCode": "WD-2-1",
    "topicName": "HTML and CSS - the Foundation of Web Pages"
  }
]
```

#### Update Sprint
**PATCH** `/sprints/:id`

Update an existing sprint.

**Request Body:**
```json
{
  "sprintCode": "WD-2-1",
  "topicName": "Advanced HTML and CSS Techniques"
}
```

**Response:**
```json
{
  "id": 3,
  "sprintCode": "WD-2-1",
  "topicName": "Advanced HTML and CSS Techniques"
}
```

#### Delete Sprint
**DELETE** `/sprints/:id`

Delete a specific sprint.

**Response:**
```json
{
  "message": "Sprint deleted successfully"
}
```

### Users

#### Get All Users
**GET** `/users`

Retrieve all users from the database.

**Notes:**
- Users are fetched from the Discord channel when the bot starts and stored in the database
- This endpoint is useful to check valid usernames for message creation

**Response:**
```json
[
  {
    "id": "123456789012345678",
    "username": "johdoe"
  },
  {
    "id": "987654321098765432",
    "username": "janedoe"
  }
]
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `404` - Not Found
- `500` - Internal Server Error



## Project Structure

```bash
Discord-Bot-with-a-REST-API
├── data
│   └── database.db
├── src
│   ├── app.ts
│   ├── index.ts
│   ├── config
│   │   ├── configs.ts
│   │   └── configErrorLogger.ts
│   ├── database
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── tests
│   │   │   └── index.test.ts
│   │   ├── migrate
│   │   │   ├── bin.ts
│   │   │   └── index.ts
│   │   └── migrations
│   │       ├── 20250617152100-renameSprintNameToCode.ts
│   │       └── 20250529150500-createDiscordBotDatabase.ts
│   ├── middleware
│   │   └── jsonErrors.ts
│   ├── modules
│   │   ├── discord
│   │   │   └── discordService.ts
│   │   │   └── tests
│   │   │       └── discordService.test.ts
│   │   ├── images
│   │   │   ├── loadImages.ts
│   │   │   ├── getImages.ts
│   │   │   ├── repository.ts
│   │   │   ├── saveImages.ts
│   │   │   └── tests
│   │   │       ├── loadImages.test.ts
│   │   │       ├── repository.test.ts
│   │   │       ├── saveImage.test.ts
│   │   │       └── getImages.test.ts
│   │   ├── messages
│   │   │   ├── controller.ts
│   │   │   ├── generator.ts
│   │   │   ├── schema.ts
│   │   │   ├── validator.ts
│   │   │   ├── repository.ts
│   │   │   ├── messages.ts
│   │   │   ├── tests
│   │   │   │   ├── controller.test.ts
│   │   │   │   ├── generator.test.ts
│   │   │   │   ├── repository.test.ts
│   │   │   │   ├── messages.test.ts
│   │   │   │   └── validator.test.ts
│   │   │   └── utils
│   │   │       ├── getRandomImage.ts
│   │   │       ├── getRandomTemplates.ts
│   │   │       └── tests
│   │   │           ├── getRandomImage.test.ts
│   │   │           └── getRandomTemplates.test.ts
│   │   ├── sprints
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── validator.ts
│   │   │   ├── sprints.ts
│   │   │   ├── tests
│   │   │   │   ├── controller.test.ts
│   │   │   │   ├── repository.test.ts
│   │   │   │   ├── sprints.test.ts
│   │   │   │   └── validator.test.ts
│   │   │   └── data
│   │   │       └── sprintData.ts
│   │   ├── templates
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── templates.ts
│   │   │   ├── validator.ts
│   │   │   ├── tests
│   │   │   │   ├── controller.test.ts
│   │   │   │   ├── repository.test.ts
│   │   │   │   ├── templates.test.ts
│   │   │   │   └── validator.test.ts
│   │   │   └── data
│   │   │       └── templateData.ts
│   │   └── users
│   │       ├── controller.ts
│   │       ├── repository.ts
│   │       ├── loadUsersData.ts
│   │       ├── users.ts
│   │       └── tests
│   │           ├── controller.test.ts
│   │           ├── repository.test.ts
│   │           ├── users.test.ts
│   │           └── loadUsersData.test.ts
│   ├── seeds
│   │   ├── index.ts
│   │   ├── seedSprints.ts
│   │   ├── seedTemplates.ts
│   │   └── tests
│   │       ├── index.test.ts
│   │       ├── seedSprints.test.ts
│   │       └── seedTemplates.test.ts
│   ├── tests
│   │   ├── app.test.ts
│   │   └── index.test.ts
│   └── utils
│       ├── middleware.ts
│       └── errors
│           ├── BadRequest.ts
│           ├── ErrorLogger.ts
│           ├── MethodNotAllowed.ts
│           └── NotFound.ts
├── tests
│   └── utils
│       ├── createTestDatabase
│       │   ├── ModuleMigrationProvider.ts
│       │   ├── index.ts
│       │   └── databaseCleaner.ts
│       ├── fixtures.ts
│       ├── mockDiscordService.ts
│       └── records.ts
├── .env
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.eslint.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.js
```

**Peer programming exercise**
[GitHub Repository](https://github.com/RaimisM/Movie-ticket-booking-system) 