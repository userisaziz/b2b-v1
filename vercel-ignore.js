#!/usr/bin/env node

// This script determines whether Vercel should deploy a project based on what files changed
const { execSync } = require('child_process');

// Get the list of changed files compared to the base branch
try {
  // Get the base branch (usually main or master)
  const baseBranch = process.env.VERCEL_GIT_COMMIT_REF === 'main' ? 'main' : 'main';
  
  // Get the list of changed files
  const changedFiles = execSync(`git diff --name-only HEAD ${baseBranch}`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  console.log('Changed files:', changedFiles);

  // Determine which project to deploy based on changed files
  const project = process.env.VERCEL_PROJECT_NAME;
  
  if (!project) {
    console.log('No project name specified, allowing deployment');
    process.exit(1); // Allow deployment
  }

  let shouldDeploy = false;

  switch (project) {
    case 'b2b-v1-admin':
      shouldDeploy = changedFiles.some(file => 
        file.startsWith('admin-panel/') || 
        file.startsWith('backend/') ||
        file === 'package.json' ||
        file === 'vercel.json'
      );
      break;
      
    case 'b2b-v1-seller':
      shouldDeploy = changedFiles.some(file => 
        file.startsWith('seller-panel/') || 
        file.startsWith('backend/') ||
        file === 'package.json' ||
        file === 'vercel.json'
      );
      break;
      
    case 'b2b-v1-storefront':
      shouldDeploy = changedFiles.some(file => 
        file.startsWith('store-front/') || 
        file.startsWith('backend/') ||
        file === 'package.json' ||
        file === 'vercel.json'
      );
      break;
      
    default:
      shouldDeploy = true; // Deploy by default if we can't determine the project
  }

  if (shouldDeploy) {
    console.log(`Deploying ${project} because relevant files changed`);
    process.exit(1); // Allow deployment
  } else {
    console.log(`Skipping deployment of ${project} because no relevant files changed`);
    process.exit(0); // Skip deployment
  }
} catch (error) {
  console.error('Error in vercel-ignore script:', error);
  process.exit(1); // Allow deployment by default if there's an error
}