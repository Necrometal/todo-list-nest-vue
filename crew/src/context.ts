import { execFileSync } from 'node:child_process';

export type Feature = 'auth' | 'users' | 'todos' | 'todo-history' | 'shared';

const BACKEND_FEATURE_DIRS: Record<string, Feature> = {
  auth: 'auth',
  users: 'users',
  todos: 'todos',
  'todo-history': 'todo-history',
};

const FRONTEND_FEATURE_PATTERNS: Array<{ feature: Feature; pattern: RegExp }> = [
  { feature: 'auth', pattern: /(views\/(Login|Register)View\.vue|stores\/auth\.ts)$/ },
  { feature: 'todos', pattern: /(components\/todos\/|views\/TodosView\.vue|stores\/todos\.ts)/ },
  { feature: 'todo-history', pattern: /(views\/HistoryView\.vue|stores\/history\.ts)$/ },
  { feature: 'users', pattern: /Profile/ },
];

function mapFileToFeature(path: string): Feature {
  if (path.startsWith('backend/src/')) {
    const rest = path.slice('backend/src/'.length);
    const segment = rest.split('/')[0];
    return BACKEND_FEATURE_DIRS[segment] ?? 'shared';
  }
  if (path.startsWith('frontend/src/')) {
    for (const { feature, pattern } of FRONTEND_FEATURE_PATTERNS) {
      if (pattern.test(path)) return feature;
    }
    return 'shared';
  }
  return 'shared';
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', cwd: process.cwd() });
}

export interface CrewContext {
  base: string;
  head: string;
  changedFiles: string[];
  diff: string;
  feature: Feature;
  featureFiles: string[];
}

export function gatherContext(base: string, head: string): CrewContext {
  const changedFiles = git(['diff', '--name-only', `${base}...${head}`])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const diff = git(['diff', `${base}...${head}`]);

  const features = new Set(changedFiles.map(mapFileToFeature));
  const feature: Feature = features.size === 1 ? [...features][0] : 'shared';

  const featureFiles =
    feature === 'shared'
      ? ['(shared/core change — load full backend/src and frontend/src as needed)']
      : listFeatureFiles(feature);

  return { base, head, changedFiles, diff, feature, featureFiles };
}

function listFeatureFiles(feature: Feature): string[] {
  const files: string[] = [];
  const backendDir = ['auth', 'users', 'todos', 'todo-history'].includes(feature)
    ? `backend/src/${feature}`
    : null;
  if (backendDir) {
    try {
      files.push(
        ...git(['ls-files', backendDir])
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      );
    } catch {
      // feature dir may not exist yet — skip
    }
  }
  try {
    files.push(
      ...git(['ls-files', 'frontend/src'])
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .filter((f) => FRONTEND_FEATURE_PATTERNS.find((p) => p.feature === feature)?.pattern.test(f)),
    );
  } catch {
    // ignore
  }
  return files;
}
