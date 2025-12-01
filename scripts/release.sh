#!/bin/bash

# Release script for sentinel-password
# This script automates the release process following the RELEASE.md guide

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Aborted by user"
        exit 1
    fi
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d ".changeset" ]; then
    error "This script must be run from the repository root"
    exit 1
fi

# Check if we have required tools
for tool in gh git pnpm; do
    if ! command -v $tool &> /dev/null; then
        error "$tool is not installed. Please install it first."
        exit 1
    fi
done

info "Starting release process for sentinel-password..."
echo

# Step 1: Check current branch
info "Step 1: Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warning "You are on branch '$CURRENT_BRANCH', not 'main'"
    confirm "Switch to main branch? (y/n)"
    git checkout main
fi
success "On main branch"
echo

# Step 2: Pull latest changes
info "Step 2: Pulling latest changes..."
git pull
success "Repository is up to date"
echo

# Step 3: Check for pending changesets
info "Step 3: Checking for pending changesets..."
if ! pnpm changeset:status 2>&1 | grep -q "to be bumped"; then
    warning "No pending changesets found"
    confirm "Do you want to add a changeset now? (y/n)"
    pnpm changeset:add
fi
pnpm changeset:status
echo

# Step 4: Create version bump branch and PR
info "Step 4: Creating version bump..."
confirm "Create version packages PR? (y/n)"

# Delete the branch if it exists locally
if git show-ref --verify --quiet refs/heads/changeset-release/main; then
    warning "Local branch 'changeset-release/main' already exists, deleting it..."
    git branch -D changeset-release/main
fi

# Create new branch
git checkout -b changeset-release/main

# Run changeset version with GitHub token
info "Running changeset version..."
GITHUB_TOKEN=$(gh auth token) pnpm changeset version

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    error "No changes to commit. The version may have already been bumped."
    git checkout main
    git branch -D changeset-release/main
    exit 1
fi

# Show the changes
info "Changes to be committed:"
git status --short
echo

# Commit and push
git add .
git commit -m "chore: version packages"
git push -u origin changeset-release/main --force

success "Version bump branch pushed"
echo

# Step 5: Create PR
info "Step 5: Creating pull request..."

PR_BODY="This PR bumps package versions and updates changelogs based on recent changesets.

## Changes
$(git diff main HEAD --stat)

Once merged, run the Release workflow to publish to npm."

PR_URL=$(gh pr create --title "chore: version packages" --body "$PR_BODY" 2>&1 || echo "")

if [ -z "$PR_URL" ]; then
    # PR might already exist
    warning "PR might already exist, checking..."
    PR_URL=$(gh pr list --head changeset-release/main --json url --jq '.[0].url')
    if [ -n "$PR_URL" ] && [ "$PR_URL" != "null" ]; then
        info "Existing PR found: $PR_URL"
    else
        error "Failed to create or find PR"
        exit 1
    fi
else
    success "Pull request created: $PR_URL"
fi
echo

# Step 6: Ask to merge PR
confirm "Merge the PR now? (y/n)"

# Get PR number from URL
PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$')

gh pr merge "$PR_NUMBER" --merge
success "PR merged"

# Switch back to main and pull
git checkout main
git pull
success "Back on main branch with latest changes"
echo

# Step 7: Publish to npm
info "Step 7: Publishing to npm..."
confirm "Trigger the release workflow to publish to npm? (y/n)"

gh workflow run release.yml
success "Release workflow triggered"
echo

# Wait a moment and show the workflow status
sleep 3
info "Checking workflow status..."
gh run list --workflow=release.yml --limit 1
echo

info "Release process initiated!"
info "Monitor the workflow at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/workflows/release.yml"
echo
success "Done! The package will be published to npm once the workflow completes."
