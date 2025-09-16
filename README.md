# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## Git: If `git` command is not recognized on Windows

If you see this error in PowerShell:

```
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

You have two options:

A) Install Git (recommended)
- Download Git for Windows: https://git-scm.com/download/win
- During setup, keep “Add Git to PATH” enabled.
- Close and reopen your terminal (or reboot), then verify:
  - `git --version`
  - `git status`

If it still fails, ensure Git is on PATH in System Properties > Environment Variables, or launch "Git Bash" and run commands there.

B) Use the project’s Node-based Git fallback (no system Git required)
This repo includes a lightweight Git workflow using isomorphic-git so you can init and commit without installing Git.

1. Install dependencies:
```
npm install
```
2. Initialize a repo and make an initial commit:
```
npm run git:init
```
3. Commit changes later:
```
npm run git:commit -- "your commit message"
```

Notes:
- The first run creates a .git folder and a .gitignore with sensible defaults.
- It also sets local user.name and user.email if missing. You can override via env vars:
  - `GIT_AUTHOR_NAME="Your Name" GIT_AUTHOR_EMAIL="you@example.com" npm run git:commit -- "msg"`
- This fallback supports local init/add/commit. For pushing to remotes, install system Git or wire isomorphic-git remote/push as needed.
