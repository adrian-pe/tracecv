# TraceCV Frontend

Next.js web application for TraceCV.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
frontend/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utility functions
├── public/          # Static files
├── styles/          # Global styles
├── package.json
└── README.md
```

## Planned Features

- [ ] User authentication
- [ ] GitHub profile connection UI
- [ ] Skill profile display
- [ ] Activity timeline
- [ ] Public profile URLs
- [ ] Export functionality

## API Integration

This frontend communicates with the backend API running on `http://localhost:3001/api`.

See [Backend Documentation](../docs/) for API endpoints.
