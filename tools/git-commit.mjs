#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import git from 'isomorphic-git';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function ensureGitRepo(dir) {
  const gitDir = path.join(dir, '.git');
  const exists = fs.existsSync(gitDir);
  if (!exists) {
    await git.init({ fs, dir });
    console.log('Initialized empty Git repository in', gitDir);
  }
}

async function ensureConfig(dir) {
  const get = async (key) => {
    try {
      return await git.getConfig({ fs, dir, path: key });
    } catch {
      return undefined;
    }
  };
  const set = async (key, value) => {
    await git.setConfig({ fs, dir, path: key, value });
  };

  let name = await get('user.name');
  let email = await get('user.email');

  if (!name) {
    name = process.env.GIT_AUTHOR_NAME || process.env.USERNAME || 'ResumeBuddy User';
    await set('user.name', String(name));
  }
  if (!email) {
    email = process.env.GIT_AUTHOR_EMAIL || 'user@example.com';
    await set('user.email', String(email));
  }
}

const shouldIgnore = (p) => {
  const parts = p.split(path.sep);
  return (
    parts.includes('node_modules') ||
    parts.includes('.git') ||
    parts.includes('build') ||
    parts.includes('dist') ||
    parts.includes('.cache') ||
    parts.includes('.turbo')
  );
};

async function listFiles(dir, root = dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (shouldIgnore(rel)) continue;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full, root)));
    } else if (entry.isFile()) {
      files.push(rel.replace(/\\/g, '/'));
    }
  }
  return files;
}

async function stageAllChanges(dir) {
  const matrix = await git.statusMatrix({ fs, dir });
  // matrix rows: [filepath, HEAD, workingDir, stage]
  for (const row of matrix) {
    const [filepath, head, workdir /*, stage*/] = row;
    if (workdir === 0 && head === 1) {
      // deleted
      await git.remove({ fs, dir, filepath });
    } else if (workdir === 2 || workdir === 3 || (workdir === 1 && head === 0)) {
      // modified or added
      await git.add({ fs, dir, filepath });
    }
  }
}

async function commit(dir, message) {
  const sha = await git.commit({
    fs,
    dir,
    message,
    author: {
      name: (await git.getConfig({ fs, dir, path: 'user.name' })) || 'ResumeBuddy User',
      email: (await git.getConfig({ fs, dir, path: 'user.email' })) || 'user@example.com',
    },
  });
  console.log('Committed as', sha);
}

async function main() {
  const dir = process.cwd();
  await ensureDir(dir);
  await ensureGitRepo(dir);
  await ensureConfig(dir);
  // Make sure .gitignore exists with sensible defaults
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const defaults = `# Dependencies\nnode_modules/\n\n# Build outputs\ndist/\nbuild/\n\n# Logs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# OS files\n.DS_Store\nThumbs.db\n\n# Vite\n.vite\n\n# IDE\n.idea/\n.vscode/\n`;
    await fs.promises.writeFile(gitignorePath, defaults, 'utf8');
    // Stage the .gitignore
    await git.add({ fs, dir, filepath: '.gitignore' });
  }

  await stageAllChanges(dir);

  const msgArg = process.argv.slice(2).join(' ').trim();
  const message = msgArg || 'chore: commit via isomorphic-git';
  await commit(dir, message);
}

main().catch((err) => {
  console.error('git-commit failed:', err);
  process.exitCode = 1;
});
