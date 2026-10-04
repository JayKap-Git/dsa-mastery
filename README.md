# DSA Mastery

An interactive study companion to **[Competitive Programmer's Handbook](https://cses.fi/book/book.pdf)** by Antti Laaksonen.

- Every idea explained in **English and Hinglish** (switch EN / HI / Both at the top of any page)
- Every algorithm in **tested Java** (compiled for Java 11, self-checked against brute force)
- **Step-through visualisers** with synced Java code, live variables and your own inputs
- Quizzes, CSES practice lists, cheat sheets and flashcards per chapter
- Optional **GitHub sign-in** syncs progress, quiz history, section notes and your CSES Java solutions across devices
  (works offline; without an account everything stays in your browser)

Live at **https://dsa.jayantkapoor.com**.

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
npm run verify     # types, tests, Java tests, content lint, production build
```

The sign-in/sync API is a Cloudflare Worker in [`api/`](api) (`cd api && npm install && cp .dev.vars.example .dev.vars && npm run dev`).

Authoring conventions live in [CLAUDE.md](CLAUDE.md).

## License

Site code: [MIT](LICENSE). Educational content (adapted from the book): [CC BY-NC-SA 4.0](LICENSE-CONTENT).
