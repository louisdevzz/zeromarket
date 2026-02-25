# ZeroMarket

The official WASM skill registry for [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw) — browse, install, and publish tool packages for your autonomous agent.

## What is ZeroMarket?

ZeroMarket is a registry where developers can publish **WASM skill packages** — compiled WebAssembly tools that ZeroClaw agents can install and use. Skills follow a simple stdin/stdout protocol, so any language that compiles to WebAssembly works: Rust, TypeScript (Javy), Go (TinyGo), Python (componentize-py), and more.

```bash
# Install a skill in one command
zeroclaw skill install zeroclaw/weather-lookup

# The agent can use it immediately
zeroclaw agent -m "What's the weather in Hanoi?"
```

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Styling** — Tailwind CSS v4
- **Auth** — NextAuth v5 (GitHub OAuth)
- **Database** — PostgreSQL + Drizzle ORM
- **Package Manager** — pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Install dependencies

```bash
pnpm install
```

### Environment variables

Create a `.env.local` file:

```env
# GitHub OAuth — create at https://github.com/settings/developers
AUTH_GITHUB_ID=your-github-oauth-app-client-id
AUTH_GITHUB_SECRET=your-github-oauth-app-client-secret
AUTH_SECRET=your-random-secret-string

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/zeromarket
```

### Database setup

```bash
pnpm db:push
```

### Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Skill Protocol

Every ZeroMarket skill is a WASM binary that reads JSON from stdin and writes JSON to stdout:

```
// stdin → args from LLM
{"city": "Hanoi"}

// stdout → result
{"success": true, "output": "Hanoi: 28.5°C, Partly Cloudy"}
```

Required files for publishing:

| File | Required | Description |
|------|----------|-------------|
| `tool.wasm` | ✓ | Compiled WASM binary |
| `manifest.json` | ✓ | Tool name, description, parameters schema |
| `SKILL.md` | ✓ | Skill documentation and usage |
| `README.md` | — | Optional additional docs |

## Creating a Skill

```bash
# Scaffold from a working template
zeroclaw skill new my_tool --template weather_lookup  # Rust
zeroclaw skill new my_tool --template calculator      # Rust
zeroclaw skill new my_tool --template hello_world     # TypeScript
zeroclaw skill new my_tool --template word_count      # Go

# Build (Rust example)
cd my_tool
cargo build --target wasm32-wasip1 --release
cp target/wasm32-wasip1/release/my_tool.wasm tool.wasm

# Test locally
zeroclaw skill test . --args '{"city":"hanoi"}'

# Publish to ZeroMarket — drop the folder at https://zeromarket.dev/upload
# (source code and build artifacts are filtered automatically)
```

## Installing a Skill

```bash
# From ZeroMarket registry
zeroclaw skill install namespace/skill-name

# From local path
zeroclaw skill install ./my_tool

# From git
zeroclaw skill install https://github.com/user/my-skill

# List installed skills
zeroclaw skill list
```

## API

The registry exposes a REST API consumed by `zeroclaw skill install`:

```
GET /api/v1/packages/:namespace/:name
→ { name, version, description, tools: [{ name, wasm_url, manifest_url }] }
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](https://github.com/zeroclaw-labs/zeroclaw/blob/main/CONTRIBUTING.md).

---

Built by [Potluck Labs, Inc](https://potlock.org)