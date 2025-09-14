#!/bin/bash

# Development Script for Next.js Webapp
# Usage: ./scripts/dev.sh [command]
# Commands: test, build, dev, lint, clean, all

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_section() {
    echo ""
    echo -e "${CYAN}============================================================"
    echo -e "  $1"
    echo -e "============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Test function
run_tests() {
    print_section "Running Unit Tests"
    print_info "Running unit tests with Vitest..."
    
    if pnpm test:unit; then
        print_success "Unit tests passed!"
        return 0
    else
        print_error "Unit tests failed!"
        return 1
    fi
}

# Build function
run_build() {
    print_section "Building Application"
    print_info "Building Next.js application..."
    
    if pnpm build; then
        print_success "Build successful!"
        return 0
    else
        print_error "Build failed!"
        return 1
    fi
}

# Lint function
run_lint() {
    print_section "Running Linter"
    print_info "Running ESLint..."
    
    if pnpm lint; then
        print_success "Linting passed!"
        return 0
    else
        print_error "Linting failed!"
        return 1
    fi
}

# Type check function
run_typecheck() {
    print_section "Type Checking"
    print_info "Running TypeScript type check..."
    
    if pnpm check-types; then
        print_success "Type check passed!"
        return 0
    else
        print_error "Type check failed!"
        return 1
    fi
}

# Dev server function
run_dev() {
    print_section "Starting Development Server"
    print_info "Starting Next.js development server..."
    print_warning "Press Ctrl+C to stop the server"
    
    pnpm dev
}

# Clean function
run_clean() {
    print_section "Cleaning Build Artifacts"
    print_info "Removing build artifacts..."
    
    folders_to_clean=(".next" ".turbo" "node_modules/.cache" "dist")
    
    for folder in "${folders_to_clean[@]}"; do
        if [ -d "$folder" ]; then
            rm -rf "$folder"
            print_success "Removed $folder"
        else
            print_warning "$folder doesn't exist"
        fi
    done
    
    print_success "Clean completed!"
}

# Install function
run_install() {
    print_section "Installing Dependencies"
    print_info "Installing npm dependencies..."
    
    if pnpm install; then
        print_success "Dependencies installed!"
        return 0
    else
        print_error "Installation failed!"
        return 1
    fi
}

# Run all function
run_all() {
    print_section "Running Full Development Workflow"
    
    failed_steps=()
    
    # Array of functions to run
    steps=("run_install" "run_typecheck" "run_lint" "run_tests" "run_build")
    step_names=("Install Dependencies" "Type Check" "Lint" "Unit Tests" "Build")
    
    for i in "${!steps[@]}"; do
        if ! ${steps[$i]}; then
            failed_steps+=("${step_names[$i]}")
        fi
    done
    
    print_section "Summary"
    if [ ${#failed_steps[@]} -eq 0 ]; then
        print_success "🎉 All steps completed successfully!"
    else
        print_error "❌ The following steps failed:"
        for step in "${failed_steps[@]}"; do
            echo -e "${RED}  - $step${NC}"
        done
    fi
}

# Help function
show_help() {
    echo -e "${CYAN}"
    cat << EOF

🚀 Webapp Development Script

Usage: ./scripts/dev.sh [command]

Available Commands:
  test        Run unit tests with Vitest
  build       Build the Next.js application
  dev         Start development server
  lint        Run ESLint
  typecheck   Run TypeScript type checking
  clean       Clean build artifacts and cache
  install     Install npm dependencies
  all         Run full workflow (install, typecheck, lint, test, build)
  help        Show this help message

Examples:
  ./scripts/dev.sh test
  ./scripts/dev.sh build
  ./scripts/dev.sh all

EOF
    echo -e "${NC}"
}

# Main script logic
print_section "Webapp Development Script"

# Check if pnpm is installed
if ! command_exists pnpm; then
    print_error "pnpm is not installed or not in PATH"
    print_warning "Please install pnpm first: npm install -g pnpm"
    exit 1
fi

# Get command from first argument, default to help
COMMAND=${1:-help}

# Execute the requested command
case "$COMMAND" in
    test)
        run_tests
        ;;
    build)
        run_build
        ;;
    dev)
        run_dev
        ;;
    lint)
        run_lint
        ;;
    typecheck)
        run_typecheck
        ;;
    clean)
        run_clean
        ;;
    install)
        run_install
        ;;
    all)
        run_all
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        ;;
esac

echo ""