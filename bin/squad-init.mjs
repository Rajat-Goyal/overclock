#!/usr/bin/env node
// squad-skills installer — copies the squad skills into a project (or user) for
// Claude Code and/or Codex. Zero dependencies. Idempotent.
//
//   npx github:Rajat-Goyal/squad                 # interactive
//   npx github:Rajat-Goyal/squad --claude        # Claude, project-level (.claude/skills)
//   npx github:Rajat-Goyal/squad --claude --user # Claude, user-level (~/.claude/skills)
//   npx github:Rajat-Goyal/squad --codex         # Codex (.squad + AGENTS.md)
//   npx github:Rajat-Goyal/squad --all --yes     # both, project-level, no prompts

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_SRC = path.join(PKG_ROOT, 'skills');
const SHARED_SRC = path.join(SKILLS_SRC, '_shared');
const SKILL_DIRS = ['squad-decompose', 'squad-execute', '_shared'];

const AGENTS_START = '<!-- squad:start -->';
const AGENTS_END = '<!-- squad:end -->';

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};

function parseArgs(argv) {
  const a = { claude: false, codex: false, all: false, user: false, project: false, yes: false, help: false, dir: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--claude': a.claude = true; break;
      case '--codex': a.codex = true; break;
      case '--all': a.all = true; break;
      case '--user': a.user = true; break;
      case '--project': a.project = true; break;
      case '-y': case '--yes': a.yes = true; break;
      case '-h': case '--help': a.help = true; break;
      case '--dir': a.dir = argv[++i]; break;
      default:
        if (arg.startsWith('--dir=')) a.dir = arg.slice('--dir='.length);
        else { console.error(c.yellow(`Unknown option: ${arg}`)); a.help = true; }
    }
  }
  return a;
}

function help() {
  console.log(`
${c.bold('squad-skills')} — install the squad decomposition + execution skills.

${c.bold('Usage')}
  npx github:Rajat-Goyal/squad [options]

${c.bold('Targets')}
  --claude            Install Claude Code skills
  --codex             Install Codex instructions (.squad + AGENTS.md block)
  --all               Both

${c.bold('Scope (Claude only)')}
  --project           Into ./.claude/skills   ${c.dim('(default)')}
  --user              Into ~/.claude/skills

${c.bold('Other')}
  --dir <path>        Target project dir      ${c.dim('(default: cwd)')}
  -y, --yes           Non-interactive; use defaults
  -h, --help          Show this help

With no target flags, the installer prompts interactively.`);
}

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));
}

function copyDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function installClaude(skillsRoot) {
  fs.mkdirSync(skillsRoot, { recursive: true });
  for (const d of SKILL_DIRS) copyDir(path.join(SKILLS_SRC, d), path.join(skillsRoot, d));
  console.log(`${c.green('✓')} Claude skills → ${c.cyan(skillsRoot)}`);
  console.log(c.dim('  squad-decompose, squad-execute, _shared'));
}

function codexBlock() {
  return `${AGENTS_START}
## squad workflow (agents / subagents)

This project uses the "squad" method: decompose work into right-sized, independently
verifiable stories, then execute them with subagents behind an evidence gate.

Read before working:
- \`.squad/references/schemas.md\` — user-story.json + progress.json (the contract)
- \`.squad/references/conventions.md\` — sizing, the gate, anti-drift rules, commit protocol
- \`.squad/references/adapters.md\` — run the loop with Codex agents/subagents (Codex section)

Phase 1 — decompose (then STOP): produce \`user-story.json\`, a DAG of stories; the
first is a walking skeleton; each is sized to one session and carries
\`context.read_first\` and a re-runnable \`verification\` block. End with a summary
table and open questions; wait for approval.

Phase 2 — execute (one story per iteration): select the lowest-id ready story from
the DAG, delegate implementation to a subagent, verify each acceptance criterion with
a SEPARATE subagent, write evidence to \`evidence/<story-id>/\`, close only when the
gate is green, append to \`progress.json\`.

The rule that outranks everything: never weaken an acceptance criterion to make it
pass. Two honest fix attempts, then mark \`blocked\` and escalate.
${AGENTS_END}`;
}

function installCodex(projectDir) {
  const squadDir = path.join(projectDir, '.squad');
  copyDir(path.join(SHARED_SRC, 'references'), path.join(squadDir, 'references'));
  copyDir(path.join(SHARED_SRC, 'templates'), path.join(squadDir, 'templates'));
  console.log(`${c.green('✓')} Codex references → ${c.cyan(squadDir)}`);

  const agentsPath = path.join(projectDir, 'AGENTS.md');
  const block = codexBlock();
  let next;
  if (fs.existsSync(agentsPath)) {
    const cur = fs.readFileSync(agentsPath, 'utf8');
    if (cur.includes(AGENTS_START) && cur.includes(AGENTS_END)) {
      const re = new RegExp(`${AGENTS_START}[\\s\\S]*?${AGENTS_END}`);
      next = cur.replace(re, block);
      console.log(`${c.green('✓')} AGENTS.md — updated squad block`);
    } else {
      next = cur.replace(/\s*$/, '') + '\n\n' + block + '\n';
      console.log(`${c.green('✓')} AGENTS.md — appended squad block`);
    }
  } else {
    next = `# Agent instructions\n\n${block}\n`;
    console.log(`${c.green('✓')} AGENTS.md — created with squad block`);
  }
  fs.writeFileSync(agentsPath, next);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return help();

  if (!fs.existsSync(SKILLS_SRC)) {
    console.error(c.yellow(`Could not find skills/ at ${SKILLS_SRC}. Is the package intact?`));
    process.exit(1);
  }

  const projectDir = path.resolve(args.dir || process.cwd());
  let claude = args.claude || args.all;
  let codex = args.codex || args.all;
  let userScope = args.user;
  const interactive = !args.yes && process.stdin.isTTY && !(claude || codex);

  if (interactive) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(c.bold('\nsquad-skills installer\n'));
    const t = await ask(rl, 'Install for  [1] Claude Code  [2] Codex  [3] Both  (1): ');
    claude = t === '' || t === '1' || t === '3';
    codex = t === '2' || t === '3';
    if (claude) {
      const s = await ask(rl, 'Claude scope  [1] this project  [2] user (~/.claude)  (1): ');
      userScope = s === '2';
    }
    rl.close();
  } else if (!claude && !codex) {
    claude = true; // default target when non-interactive with no flags
  }

  if (!claude && !codex) { help(); return; }

  console.log('');
  if (claude) {
    const skillsRoot = userScope
      ? path.join(os.homedir(), '.claude', 'skills')
      : path.join(projectDir, '.claude', 'skills');
    installClaude(skillsRoot);
  }
  if (codex) installCodex(projectDir);

  console.log(c.bold('\nDone.'));
  if (claude && !userScope) console.log(c.dim('Claude Code: open a session in this project; project skills auto-discover.'));
  if (claude && userScope) console.log(c.dim('Claude Code: skills are available in every project. Start a new session to pick them up.'));
  if (codex) console.log(c.dim('Codex: reads AGENTS.md automatically; references live in .squad/.'));
  console.log(c.dim('Then ask: "decompose this into stories" or "run the squad on the backlog".'));
}

main().catch((e) => { console.error(e); process.exit(1); });
