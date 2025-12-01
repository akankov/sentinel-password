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
    read -p "$(echo -e "${YELLOW}$1${NC}") " -n 1 -r
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
    if ! command -v "$tool" &> /dev/null; then
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
    # Check for uncommitted changes before switching branches
    if [ -n "$(git status --porcelain)" ]; then
        error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    git checkout main
fi
success "On main branch"
echo

# Step 2: Pull latest changes
info "Step 2: Pulling latest changes..."
if ! git pull; then
    error "Failed to pull latest changes. Please resolve any conflicts manually."
    exit 1
fi
success "Repository is up to date"
echo

# Step 3: Check for pending changesets
info "Step 3: Checking for pending changesets..."
if ! pnpm changeset:status 2>&1 | grep -q "to be bumped"; then
    warning "No pending changesets found"
    confirm "Do you want to add a changeset now? (y/n)"
    if ! pnpm changeset:add; then
        error "Changeset addition canceled"
        exit 1
    fi
fi
pnpm changeset:status
echo

# Step 4: Trigger Release workflow to create version PR
info "Step 4: Triggering Release workflow to create version bump PR..."
info "Note: The GitHub Actions workflow will create the 'chore: version packages' PR"
confirm "Trigger the Release workflow now? (y/n)"

gh workflow run release.yml
success "Release workflow triggered"
echo

# Wait for workflow to start
info "Waiting for workflow to start..."
sleep 5

# Show workflow status
info "Checking workflow status..."
LATEST_RUN=$(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
if [ -n "$LATEST_RUN" ]; then
    info "Monitoring workflow run #$LATEST_RUN..."
    gh run watch "$LATEST_RUN" --exit-status || {
        error "Workflow failed. Check the logs for details."
        info "You may need to manually create the version PR or clean up the changeset-release/main branch."
        exit 1
    }
    success "Workflow completed successfully"
else
    warning "Could not find workflow run. Check manually at:"
    info "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/workflows/release.yml"
fi
echo

# Step 5: Check for the version PR
info "Step 5: Checking for version packages PR..."
PR_URL=$(gh pr list --head changeset-release/main --json url --jq '.[0].url')

if [ -z "$PR_URL" ] || [ "$PR_URL" = "null" ]; then
    warning "No 'chore: version packages' PR found."
    info "This might happen if the workflow had issues. Would you like to create it manually?"
    confirm "Create version PR manually? (y/n)"
    
    # Manual PR creation fallback
    info "Creating version bump manually..."
    
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
    git push -u origin changeset-release/main --force-with-lease
    
    success "Version bump branch pushed"
    echo
    
    # Create PR
    info "Creating pull request..."
    PR_BODY="This PR bumps package versions and updates changelogs based on recent changesets.

## Changes
$(git diff main HEAD --stat)

Once merged, run the Release workflow to publish to npm."
    
    PR_OUTPUT=$(gh pr create --title "chore: version packages" --body "$PR_BODY" 2>&1)
    
    if echo "$PR_OUTPUT" | grep -qE '^https://github.com/'; then
        PR_URL="$PR_OUTPUT"
        success "Pull request created: $PR_URL"
    else
        if echo "$PR_OUTPUT" | grep -qi "already exists"; then
            warning "PR already exists, checking for existing PR..."
            PR_URL=$(gh pr list --head changeset-release/main --json url --jq '.[0].url')
            if [ -n "$PR_URL" ] && [ "$PR_URL" != "null" ]; then
                info "Existing PR found: $PR_URL"
            else
                error "Failed to create or find PR"
                exit 1
            fi
        else
            error "Failed to create PR: $PR_OUTPUT"
            exit 1
        fi
    fi
    
    # Switch back to main
    git checkout main
else
    info "Version packages PR found: $PR_URL"
fi
echo

# Step 6: Review and merge PR
info "Step 6: Review and merge the version packages PR"
info "PR URL: $PR_URL"
confirm "Have you reviewed the PR? Merge it now? (y/n)"

# Get PR number from URL
PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$')

if [ -z "$PR_NUMBER" ]; then
    error "Failed to extract PR number from URL: $PR_URL"
    exit 1
fi

gh pr merge "$PR_NUMBER" --merge
success "PR merged"
echo

# Pull the merged changes
info "Pulling merged changes..."
if ! git pull; then
    error "Failed to pull merged changes"
    exit 1
fi
success "Repository updated with version changes"
echo

# Step 7: Trigger workflow again to publish to npm
info "Step 7: Publishing to npm..."
info "Now we'll trigger the Release workflow again to publish to npm"
confirm "Trigger the Release workflow to publish? (y/n)"

gh workflow run release.yml
success "Release workflow triggered for publishing"
echo

# Wait and monitor
sleep 5
info "Monitoring publish workflow..."
LATEST_RUN=$(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -n "$LATEST_RUN" ]; then
    gh run watch "$LATEST_RUN" --exit-status || {
        error "Publish workflow failed. Check the logs for details."
        exit 1
    }
    success "Package published successfully!"
else
    warning "Could not monitor workflow. Check manually at:"
    info "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/workflows/release.yml"
fi
echo

info "Release process complete!"
success "Check npm: https://www.npmjs.com/package/@sentinel-password/core"
success "Check releases: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases"
