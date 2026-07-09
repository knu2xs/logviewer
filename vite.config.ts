import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

function getGithubPagesBasePath(): string {
  if (!process.env.GITHUB_ACTIONS) {
    return '/';
  }

  const repositorySlug = process.env.GITHUB_REPOSITORY;

  if (!repositorySlug) {
    return '/';
  }

  const repositoryName = repositorySlug.split('/')[1] ?? '';

  // User/organization Pages repositories are served from root.
  if (repositoryName.toLowerCase().endsWith('.github.io')) {
    return '/';
  }

  return `/${repositoryName}/`;
}

// https://vite.dev/config/
export default defineConfig({
  base: getGithubPagesBasePath(),
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
