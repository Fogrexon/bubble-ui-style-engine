# GitHub Copilot Instructions for Bubble UI

## Project Overview

## Project Structure
- `src/`: Source code for the library
- `api-docs/`: Documentation for the API

## Coding Conventions
- Use TypeScript for all new code
- Use arrow functions for standalone function definitions instead of traditional function declarations. Class methods can use the standard method syntax.
- Follow existing code style and patterns
- Comment public functions and classes with JSDoc
- Minimize inline comments; use them only for complex logic that JSDoc cannot adequately explain. Rely primarily on JSDoc for documenting functions, classes, and types.
- Maintain type safety
- Write unit tests for new functionality
- Avoid adding unnecessary comments or blank lines.
- Edit files directly when necessary, without asking for confirmation in chat.

## Interaction Preferences
- Respond in Japanese in chat.
- Write code comments in English.

## Pull Request Expectations
- All tests should pass
- Code should be properly formatted
- No TypeScript errors
- Documentation should be updated for new features
- Examples should be provided for new components

## Useful Files to Reference
- `api-docs/**.md`: For documentation

## Project Goals
- Maintain a lightweight, performant UI library
- Ensure type safety and good developer experience
- Provide clear documentation
- Support various styling options

## Development Workflow
1. Make changes to the source code
2. Run tests to ensure functionality
3. Update documentation if needed
4. Submit a pull request for review

## Dependencies
The project uses the following key dependencies:
- TypeScript for type checking
- Rollup for bundling
- Jest for testing
- Pixi.js v8 for rendering
