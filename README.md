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
│   │   ├── data
│   │   │   ├── sprintData.ts
│   │   │   └── textData.ts
│   │   ├── migrate
│   │   │   ├── bin.ts
│   │   │   └── index.ts
│   │   └── migrations
│   │       └── createDiscordBotDatabase.ts

│   ├── middleware
│   │   └── jsonErrors.ts
│   ├── modules
│   │   ├── discord
│   │   │   └── discordService.ts
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
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       ├── repository.test.ts
│   │   │       ├── sprints.test.ts
│   │   │       └── validator.test.ts
│   │   ├── templates
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── templates.ts
│   │   │   ├── validator.ts
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       ├── repository.test.ts
│   │   │       ├── templates.test.ts
│   │   │       └── validator.test.ts
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