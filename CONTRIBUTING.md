# Contributing to TikTok Discord Scraper

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/headknod-art/tiktok-discord-scraper/issues) to avoid duplicates
2. Verify the bug exists in the latest version
3. Collect relevant information (browser version, error messages, console logs)

When creating a bug report, include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots or error messages
- Browser and extension version
- Configuration details (without sensitive tokens)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Check if the feature has already been suggested
2. Provide a clear use case for the feature
3. Explain how it would benefit users
4. Consider implementation complexity

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tiktok-discord-scraper.git
   cd tiktok-discord-scraper
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines below
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

## Development Guidelines

### Code Style

**JavaScript**:
- Use ES6+ features (const/let, arrow functions, async/await)
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public functions
- Use 2 spaces for indentation
- Use single quotes for strings

**CSS**:
- Use CSS custom properties (variables) for colors and spacing
- Follow BEM naming convention for custom classes
- Keep selectors specific but not overly nested
- Group related properties together
- Use meaningful class names

**HTML**:
- Use semantic HTML5 elements
- Keep markup clean and accessible
- Add ARIA labels where appropriate
- Use data attributes for JS hooks

### Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── background/            # Background scripts
├── popup/                 # Popup UI
├── options/               # Options page
├── lib/                   # Shared modules
├── styles/                # Shared styles
└── icons/                 # Extension icons
```

### Module Guidelines

**Creating New Modules**:
- Export functions/classes explicitly
- Use ES6 modules (import/export)
- Keep modules focused on a single responsibility
- Add comprehensive JSDoc comments
- Include error handling

**Example Module Structure**:
```javascript
/**
 * Module description
 */

import { dependency } from './other-module.js';

/**
 * Function description
 * @param {Type} param - Parameter description
 * @returns {Type} Return value description
 */
export function myFunction(param) {
  // Implementation
}

export class MyClass {
  constructor(config) {
    this.config = config;
  }
  
  /**
   * Method description
   */
  myMethod() {
    // Implementation
  }
}
```

### Testing

Before submitting a PR:
1. Load the extension in Chrome developer mode
2. Test all affected functionality
3. Check the console for errors
4. Test with different configurations
5. Verify UI responsiveness
6. Test error scenarios

### Documentation

Update documentation when:
- Adding new features
- Changing configuration options
- Modifying user workflows
- Fixing bugs that affect usage

Documentation to update:
- README.md (main documentation)
- Code comments (JSDoc)
- CHANGELOG.md (version history)
- This file (if process changes)

## Commit Message Guidelines

Use clear, descriptive commit messages:

**Format**:
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat: Add Instagram scraping support

Implement Instagram profile scraping with similar
filtering options as TikTok scraper.

Closes #123
```

```
fix: Resolve Discord posting rate limit issue

Add exponential backoff retry logic to handle
Discord API rate limits gracefully.

Fixes #456
```

## Release Process

Maintainers follow this process for releases:

1. Update version in `manifest.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Create a GitHub release
5. Package extension for Chrome Web Store

## Questions?

If you have questions about contributing:
- Open a [Discussion](https://github.com/headknod-art/tiktok-discord-scraper/discussions)
- Comment on a related issue
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TikTok Discord Scraper! 🎉
