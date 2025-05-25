# Custom Footer Guide for Tool Developers

This guide explains how to add a custom footer to your tool in SafeWebTool.

## Overview

Every tool can have its own custom footer that replaces the site-wide footer. When users navigate away from your tool, the original footer is automatically restored.

The custom footer maintains the same layout as the original SafeWebTool footer:
- Left side: Icon + © Author Name | Version
- Right side: Links (or "← Back to SafeWebTool" if no links)

## How to Add a Custom Footer

Add a `customFooter` object to your tool's configuration:

```javascript
import { Tool } from '../common/base.js';

class MyTool extends Tool {
  constructor() {
    super({
      id: 'my-tool',
      name: 'My Tool',
      category: 'text',
      template: myTemplate,
      customFooter: {
        author: 'Your Name',              // Required: Your name
        authorUrl: 'https://your-website.com',  // Optional: Your website/profile
        version: '1.0.0',                // Optional: Tool version
        icon: '/src/assets/logo.svg',    // Optional: Icon (URL or emoji)
        links: [                         // Optional: Additional links
          {
            text: 'GitHub',
            url: 'https://github.com/yourusername',
            icon: '🐙',              // Optional: Icon for the link
            external: true           // Opens in new tab (default: true)
          },
          {
            text: 'LinkedIn',
            url: 'https://linkedin.com/in/yourusername',
            external: true
          }
        ],
        showBackLink: true  // Optional: Show "← Back to SafeWebTool" link (default: true)
      }
    });
  }
  
  async setup() {
    // Your tool initialization code
  }
}

export function initTool() {
  const tool = new MyTool();
  return tool.init();
}
```

## Configuration Options

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `author` | string | **Yes** | Your name or organization |
| `authorUrl` | string | No | Link to your website or profile |
| `version` | string | No | Tool version (e.g., "1.0.0") |
| `icon` | string | No | Icon URL (e.g., "/src/assets/logo.svg") or emoji (e.g., "🎬") |
| `links` | array | No | Additional links for the right side of footer |
| `showBackLink` | boolean | No | Show "← Back to SafeWebTool" link (default: true) |

### Links Array Format

Each link in the `links` array should have:

```javascript
{
  text: 'Link Text',        // Required: Display text
  url: 'https://...',      // Required: Link URL
  icon: '📖',              // Optional: Emoji or text icon
  external: true           // Optional: Open in new tab (default: true)
}
```

## Best Practices for Multiple Tools

If you're creating multiple tools with the same footer information, use a shared configuration file to avoid repetition:

### 1. Create a Shared Configuration File

Create `/src/common/author-config.js`:

```javascript
// Shared author configuration
export const MY_FOOTER = {
  author: 'Your Name',
  version: '1.0.0',
  icon: '/src/assets/logo.svg',
  links: [
    {
      text: 'GitHub',
      url: 'https://github.com/yourusername',
      external: true
    },
    {
      text: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      external: true
    },
    {
      text: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/yourusername',
      external: true
    }
  ],
  showBackLink: false
};
```

### 2. Use in Your Tools

```javascript
import { Tool } from '../common/base.js';
import { MY_FOOTER } from '../common/author-config.js';

class MyTool extends Tool {
  constructor() {
    super({
      id: 'my-tool',
      name: 'My Tool',
      category: 'text',
      template: myTemplate,
      customFooter: MY_FOOTER
    });
  }
}
```

### 3. Override Specific Fields When Needed

If you need different versions for different tools:

```javascript
import { MY_FOOTER } from '../common/author-config.js';

// In your tool
customFooter: {
  ...MY_FOOTER,
  version: '2.0.0'  // Override just the version
}
```

## Real Example

Here's how it's implemented in the Remove Extra Spaces tool:

```javascript
import { Tool } from '../common/base.js';
import { JAMSHEED_FOOTER } from '../common/author-config.js';

export const template = `
  <div class="tool-container">
    <!-- Tool HTML content -->
  </div>
`;

class RemoveExtraSpacesTool extends Tool {
  constructor() {
    super({
      id: 'remove-extra-spaces',
      name: 'Remove Extra Spaces',
      category: 'text',
      needsFileUpload: false,
      hasOutput: true,
      needsProcessButton: false,
      template,
      customFooter: JAMSHEED_FOOTER
    });
  }
  
  // Tool implementation...
}

export function initTool() {
  const tool = new RemoveExtraSpacesTool();
  return tool.init();
}
```

Where `JAMSHEED_FOOTER` is defined in `/src/common/author-config.js`:

```javascript
export const JAMSHEED_FOOTER = {
  author: 'Jamsheed Avaran Kutty',
  version: '1.0.0',
  icon: '/src/assets/logo.svg',
  links: [
    {
      text: 'GitHub',
      url: 'https://github.com/Jamsheed-CS',
      external: true
    },
    {
      text: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/kjamsheed/',
      external: true
    },
    {
      text: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/kjamsheed',
      external: true
    }
  ],
  showBackLink: false
};
```

## What the Footer Looks Like

Your custom footer will display:
1. **Left side**: Icon + "© Author Name | Version: X.X.X"
2. **Right side**: Your custom links or "← Back to SafeWebTool" link

The footer automatically:
- Maintains the site's visual style and layout
- Supports dark mode
- Is fully responsive
- Escapes all content for security
- Restores the original footer when navigating away

## Best Practices

1. **Always include author**: This is the only required field
2. **Use the SafeWebTool logo**: For consistency, use `icon: '/src/assets/logo.svg'`
3. **Add useful links**: GitHub, LinkedIn, personal website, support channels
4. **Use semantic versions**: e.g., "1.0.0", "2.1.3"
5. **Create shared configs**: For multiple tools by the same author
6. **Keep it professional**: The footer represents both you and SafeWebTool

## Benefits of This Approach

- **Consistency**: All custom footers look and work the same way
- **Simplicity**: Just one configuration object to fill out
- **Security**: All content is automatically escaped
- **Maintenance**: Easy to update through shared configurations
- **Professional**: Gives proper credit while maintaining site aesthetics

## Troubleshooting

**Footer not showing?**
- Make sure your tool extends the `Tool` class
- Check that `customFooter.author` is provided (it's required)
- Look for console warnings about missing fields

**Links not working?**
- Ensure URLs are properly formatted with protocol (https://)
- Check that the URL is wrapped in quotes

**Want to update multiple tools at once?**
- Use the shared configuration approach
- Update the config in one place, all tools get the changes

## Summary

With this simple configuration system, you can:
1. Give proper credit to tool authors
2. Maintain visual consistency with SafeWebTool
3. Provide links to your other work
4. Keep the codebase clean and maintainable

The footer system is designed to be simple for developers while providing a professional appearance for users. 