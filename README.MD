## Introduction

Pumpfessions is a terminal themed feed for users to post their confessions for their activities on pump.fun and in the Solana ecosystem.

Pumpfessions now supports a live shared feed (multi-user) via a lightweight Node/Express backend (SSE real-time updates).

## Features

- Terminal-style interface with authentic command-line aesthetics
- Anonymous confession posting system
- Local persistent storage (browser localStorage)
- Interactive terminal commands
- Retro green-on-black styling

## Usage

This is a pure static site. Open `index.html` directly in a modern browser (double-click or drag into a tab). No build or local server is required.

## Commands

- `confess <message>` - Post a new confession
- `feed` - View recent confessions
- `clear` - Clear the terminal
- `help` - Show available commands

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage for persistence

## Live (Multi-User) Mode

1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Open: http://localhost:3000
4. All connected browsers see new confessions instantly.

## API

- GET /api/confessions
- POST /api/confessions { message }
- GET /api/stream (SSE)

Falls back to local-only mode if server unreachable.

## Notes

All data stays in your browser; nothing is uploaded.