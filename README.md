## Project Structure

```bash
Discord-Bot-with-a-REST-API
├── data
│   └── database.db
├── src
│   ├── app.ts
│   ├── index.ts
│   ├── config
│   │   └── configs.ts
│   ├── database
│   │   ├── data
│   │   │   ├── sprintData.ts
│   │   │   └── textData.ts
│   │   ├── migrate
│   │   │   ├── bin.ts
│   │   │   └── index.ts
│   │   └── migrations
│   │       └── TBD
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
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── validators.ts
│   │   │   ├── service.ts
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       ├── repository.test.ts
│   │   │       ├── service.test.ts
│   │   │       └── validators.test.ts
│   │   ├── sprints
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── validators.ts
│   │   │   ├── service.ts
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       └── repository.test.ts
│   │   ├── templates
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── validators.ts
│   │   │   ├── service.ts
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       └── repository.test.ts
│   │   └── users
│   │   │   ├── controller.ts
│   │   │   ├── repository.ts
│   │   │   └── tests
│   │   │       ├── controller.test.ts
│   │   │       └── repository.test.ts
│   └── utils
│       ├── createMigration.ts
│       ├── fileOperations.ts
│       └── middleware.ts
│       │── errors
│       │   ├── badRequest.ts
│       │   ├── notAllowed.ts
│       │   └── notFound.ts
│       └── tests
│           ├── createMigration.test.ts
│           └── fileOperations.test.ts
├── tests
│   └── utils
│       ├── createTestDatabase
│       │   ├── ModuleMigrationProvider.ts
│       │   ├── index.ts
│       │   └── clearDatabase.ts
│       │── tests
│       │   └── index.test.ts
│       ├── discord.ts
│       └── records.ts
├── .env
├── package-lock.json
├── package.json
├── tsconfig.eslint.json
├── tsconfig.json
└── vitest.config.js
```