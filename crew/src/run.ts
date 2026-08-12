import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { gatherContext } from './context.js';

interface Args {
  base: string;
  head: string;
  trigger: 'manual' | 'pr' | 'merge';
  prNumber: string | null;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string, fallback: string | null) => {
    const i = argv.indexOf(flag);
    return i === -1 ? fallback : argv[i + 1];
  };
  const trigger = (get('--trigger', 'manual') as Args['trigger']) ?? 'manual';
  return {
    base: get('--base', 'master')!,
    head: get('--head', 'HEAD')!,
    trigger,
    prNumber: get('--pr-number', null),
  };
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function runAgent(agentName: string, prompt: string): string {
  const raw = execFileSync(
    'claude',
    ['--agent', agentName, '-p', prompt, '--output-format', 'json', '--permission-mode', 'bypassPermissions'],
    { encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 },
  );
  const parsed = JSON.parse(raw);
  if (parsed.is_error) {
    throw new Error(`${agentName} failed: ${parsed.result}`);
  }
  return parsed.result as string;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const context = gatherContext(args.base, args.head);

  if (context.changedFiles.length === 0) {
    console.log('No changed files between base and head — nothing to review.');
    return;
  }

  const branch = git(['rev-parse', '--abbrev-ref', args.head]);
  const commit = git(['rev-parse', '--short', args.head]);
  const date = new Date().toISOString().slice(0, 10);

  const reportsDir = 'reports';
  if (!existsSync(reportsDir)) mkdirSync(reportsDir);
  const reportPath = `${reportsDir}/${date}-${args.trigger}-${context.feature}-${commit}.md`;

  const sharedPreamble = [
    `Feature: ${context.feature}`,
    `Feature files for context:\n${context.featureFiles.join('\n')}`,
    `Diff (${args.base}...${args.head}):`,
    '```diff',
    context.diff,
    '```',
  ].join('\n\n');

  console.log(`Running reviewer, test-qa, security for feature "${context.feature}"...`);
  const reviewerOutput = runAgent('crew-reviewer', sharedPreamble);
  const testQaOutput = runAgent('crew-test-qa', sharedPreamble);
  const securityOutput = runAgent('crew-security', sharedPreamble);

  console.log('Running reporter...');
  const reporterPrompt = [
    `Target file path (write here, exactly): ${reportPath}`,
    `trigger: ${args.trigger}`,
    `branch: ${branch}`,
    `commit: ${commit}`,
    `pr_number: ${args.prNumber ?? 'null'}`,
    `feature: ${context.feature}`,
    `date: ${date}`,
    reviewerOutput,
    testQaOutput,
    securityOutput,
  ].join('\n\n');
  runAgent('crew-reporter', reporterPrompt);

  if (!existsSync(reportPath)) {
    throw new Error(`Reporter did not write expected report at ${reportPath}`);
  }
  const report = readFileSync(reportPath, 'utf8');
  const statusMatch = report.match(/^status:\s*(\S+)/m);
  const status = statusMatch?.[1] ?? 'unknown';

  console.log(`Report written: ${reportPath}`);
  console.log(`Status: ${status}`);

  if (status === 'fail') {
    process.exitCode = 1;
  }
}

main();
