# Daiku

A tactical hex-based combat simulator game. Originally created as a dice manager for tabletop games, this project has evolved into Daiku, a turn-based strategy game with detailed combat mechanics. Built with Next.js and Material-UI.

## Features

- Hex-based tactical combat system
- Various unit types with unique combat attributes
- Terrain effects on combat
- Turn-based gameplay with movement and combat phases
- Detailed combat logging system
- Health and damage tracking

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Material-UI
- Local Storage for data persistence

## Development

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:8421](http://localhost:8421) with your browser to see the result.

## Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Deployment

This application is deployed to [dicemanager.com](https://dicemanager.com) via Vercel.

Deployment happens automatically when changes are merged to the `main` branch on GitHub. The process follows these steps:

1. Code changes are pushed to the `main` branch
2. Vercel automatically detects the changes and triggers a new build
3. The application is deployed to the production environment

Manual deployments can also be performed using the Vercel CLI:

```bash
npm install -g vercel # If you don't have the Vercel CLI installed
vercel # Deploy to preview environment
vercel --prod # Deploy to production
```

While the domain is still dicemanager.com, the application has been repurposed to focus on the Daiku combat simulator. The repository structure maintains some references to the original dice manager functionality for historical reasons.

## Environment Variables

No environment variables are required for basic functionality.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
