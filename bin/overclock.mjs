#!/usr/bin/env node
// overclock installer — copies the overclock skill collection into a project (or
// user) for Claude Code and/or Codex. Zero dependencies. Idempotent.
// Skills are auto-discovered, so adding a new skill needs no change here.
//
//   npx github:Rajat-Goyal/overclock                 # interactive
//   npx github:Rajat-Goyal/overclock --claude        # Claude, project (.claude/skills)
//   npx github:Rajat-Goyal/overclock --claude --user # Claude, user (~/.claude/skills)
//   npx github:Rajat-Goyal/overclock --codex         # Codex (.overclock + AGENTS.md)
//   npx github:Rajat-Goyal/overclock --all --yes     # both, project, no prompts

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_SRC = path.join(PKG_ROOT, 'skills');

const START = '<!-- overclock:start -->';
const END = '<!-- overclock:end -->';

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};

// Every top-level entry under skills/ (skill dirs + _shared) is copied verbatim.
function skillEntries() {
  return fs.readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

// Skill dirs are those containing a SKILL.md (excludes _shared).
function discoverSkills() {
  return skillEntries()
    .filter((name) => fs.existsSync(path.join(SKILLS_SRC, name, 'SKILL.md')))
    .map((name) => ({ name, ...readFrontmatter(path.join(SKILLS_SRC, name, 'SKILL.md')) }));
}

function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].trim();
    }
  }
  return { description: fm.description || '' };
}

function firstSentence(s, max = 160) {
  const dot = s.indexOf('. ');
  let out = dot > 0 ? s.slice(0, dot + 1) : s;
  if (out.length > max) out = out.slice(0, max - 1).trimEnd() + '…';
  return out;
}

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
  const skills = discoverSkills().map((s) => `  ${c.cyan(s.name)} — ${c.dim(firstSentence(s.description, 80))}`).join('\n');
  console.log(`
${c.bold('overclock')} — install the overclock skill collection.

${c.bold('Usage')}
  npx github:Rajat-Goyal/overclock [options]

${c.bold('Targets')}
  --claude            Install Claude Code skills
  --codex             Install Codex instructions (.overclock + AGENTS.md block)
  --all               Both

${c.bold('Scope (Claude only)')}
  --project           Into ./.claude/skills   ${c.dim('(default)')}
  --user              Into ~/.claude/skills

${c.bold('Other')}
  --dir <path>        Target project dir      ${c.dim('(default: cwd)')}
  -y, --yes           Non-interactive; use defaults
  -h, --help          Show this help

${c.bold('Skills in this collection')}
${skills}

With no target flags, the installer prompts interactively.`);
}

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));
}

function copyInto(destRoot) {
  fs.mkdirSync(destRoot, { recursive: true });
  for (const entry of skillEntries()) {
    fs.cpSync(path.join(SKILLS_SRC, entry), path.join(destRoot, entry), { recursive: true });
  }
}

function installClaude(skillsRoot) {
  copyInto(skillsRoot);
  const names = discoverSkills().map((s) => s.name).join(', ');
  console.log(`${c.green('✓')} Claude skills → ${c.cyan(skillsRoot)}`);
  console.log(c.dim(`  ${names}, _shared`));
}

function codexBlock() {
  const list = discoverSkills()
    .map((s) => `- **${s.name}** — ${firstSentence(s.description)}`)
    .join('\n');
  return `${START}
## overclock skills

This project has the overclock skill collection installed at \`.overclock/skills/\`.
Read a skill's \`SKILL.md\` before using it.

${list}

Running the **squad workflow** under Codex: use agents/subagents as described in
\`.overclock/skills/_shared/references/adapters.md\` (Codex section). The method,
schemas, and evidence gate are in \`.overclock/skills/_shared/references/\`.

The rule that outranks everything: never weaken an acceptance criterion to make a
story pass. Two honest fix attempts, then mark it blocked and escalate.
${END}`;
}

function installCodex(projectDir) {
  const root = path.join(projectDir, '.overclock', 'skills');
  copyInto(root);
  console.log(`${c.green('✓')} Codex skills → ${c.cyan(path.join(projectDir, '.overclock', 'skills'))}`);

  const agentsPath = path.join(projectDir, 'AGENTS.md');
  const block = codexBlock();
  let next;
  if (fs.existsSync(agentsPath)) {
    const cur = fs.readFileSync(agentsPath, 'utf8');
    if (cur.includes(START) && cur.includes(END)) {
      next = cur.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
      console.log(`${c.green('✓')} AGENTS.md — updated overclock block`);
    } else {
      next = cur.replace(/\s*$/, '') + '\n\n' + block + '\n';
      console.log(`${c.green('✓')} AGENTS.md — appended overclock block`);
    }
  } else {
    next = `# Agent instructions\n\n${block}\n`;
    console.log(`${c.green('✓')} AGENTS.md — created with overclock block`);
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
    console.log(c.bold('\noverclock installer\n'));
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
  if (codex) console.log(c.dim('Codex: reads AGENTS.md automatically; skills live in .overclock/skills/.'));
  console.log(c.dim('Try: "de-risk this product.md", "decompose this into stories", or "run the squad on the backlog".'));
}

main().catch((e) => { console.error(e); process.exit(1); });
