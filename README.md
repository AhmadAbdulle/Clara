CLARA — Cyber Log Analysis and Response Assistant
A web app that analyses security log files using AI. Drop in a log, get a structured breakdown of every threat, see it mapped to MITRE ATT&CK, and ask follow-up questions to a built-in analyst chat. Export the whole thing as a PDF incident report when you are done.
Live demoo: https://github.com/AhmadAbdulle/Clara

What it does
Reading through hundreds of lines of access logs looking for a brute force attempt or SQL injection is tedious and easy to get wrong. CLARA automates that first pass. You paste or upload a log file and it comes back with every suspicious event classified by severity, tagged with a MITRE ATT&CK technique ID, scored out of 100, and paired with a recommended action. After that you can type questions directly to the analyst chat and it will answer based on what it found in your specific log.

Features
Log support: Apache, Nginx, Linux auth logs, Syslog, Windows Event Logs, Snort, Suricata, and any plain text log file.
Analysis output: severity classification (Critical, High, Medium, Low), MITRE ATT&CK tactic and technique IDs, overall risk score, confidence rating per finding, suspicious IP extraction, and remediation steps.
Attack timeline: a draggable floating window that maps the kill chain in chronological order.
Analyst chat: ask anything about the findings in plain English. The model has the full log and analysis in context.
Sessions: run multiple analyses in one browser session and switch between them.
Exports: PDF incident report, SOC summary, and full chat transcript.
Sample logs: four preloaded attack scenarios so you can see it working immediately without finding your own log file.

How it is built
Frontend is React 18 with Vite. Styling is plain CSS modules. Backend is Vercel Serverless Functions in Node.js. The AI model is Claude Sonnet 4.6 via the Anthropic API. PDF export uses jsPDF.

Security
The Anthropic API key never reaches the browser. Every AI call goes through a serverless function that adds the key from an environment variable server-side. The frontend only ever talks to /api/analyse, /api/chat, and /api/timeline. The key itself lives only in Vercel environment variables and is never committed to the repo.
On top of that: log input is capped at 50,000 characters, requests over the limit get a 400, rate limiting is set to 5 analyses and 20 chat messages per IP per day with a 429 on breach, and CORS is restricted to the deployment domain in production.

Running it locally
You need Node 18 or higher and an Anthropic API key from console.anthropic.com.
git clone https://github.com/AhmadAbdulle/clara.git
cd clara
npm install
npm install -g vercel
Create a file called .env.local in the root and add this line:
ANTHROPIC_API_KEY=your_key_here
Do not commit that file. It is already in .gitignore but worth double checking.
Then start the dev server with:
vercel dev
Do not use npm run dev on its own. It starts the frontend but not the serverless functions, so all the API calls will fail.

Deploying
vercel login
vercel --prod
When it asks for environment variables add ANTHROPIC_API_KEY with your key. After it deploys, paste the live URL into the readme where the placeholder is and push.

Keyboard shortcuts
/ focuses the log input
Cmd+Enter or Ctrl+Enter runs the analysis
Cmd+K or Ctrl+K opens the command palette
Escape closes any open modal

File structure
clara/
├── api/
│   ├── analyse.js
│   ├── chat.js
│   ├── timeline.js
│   └── utils/rateLimiter.js
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── logo.png
├── .env.local
├── .gitignore
├── vercel.json
├── vite.config.js
└── package.json

What I picked up building this
The hardest part was getting consistent structured output from the model across different log formats. The prompt needs to be specific enough about the output schema that it produces the same JSON structure every time, otherwise the frontend breaks. Getting that right took a lot of iteration.
The security side was straightforward once I understood why it mattered. Leaving an API key in client-side JavaScript on a public repo gets picked up by bots within hours. Proxying through a serverless function is a simple fix that removes the risk entirely.
The MITRE ATT&CK mapping pushed me to actually read the framework properly. You cannot just slap a technique ID on a finding without knowing what the technique describes. That research ended up being one of the more useful parts of the project.

What is coming next
IOC enrichment via VirusTotal, SIEM export in Splunk and Elastic formats, a live demo mode with a preloaded sample analysis, and PCAP support for network traffic analysis.

Built by Ahmad
