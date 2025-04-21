/**
 * Centralized metadata for all tools
 * Used for SEO, tool descriptions, and site structure
 */

// Tool categories metadata
export const categories = {
  video: {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and convert your videos with ease directly in your browser, no upload needed.',
    metaDescription: 'Free online video tools for resizing, converting, and analyzing videos. No upload required - all processing happens in your browser.',
    icon: '🎬',
    keywords: ['video tools', 'video converter', 'video processor', 'browser video tools']
  },
  image: {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and optimize your images with our browser-based tools.',
    metaDescription: 'Free online image editing and optimization tools. Resize, crop, and convert images without uploading them to a server.',
    icon: '🖼️',
    keywords: ['image tools', 'image editor', 'resize images', 'optimize images']
  },
  text: {
    id: 'text',
    name: 'Text Tools',
    description: 'Simple text manipulation and formatting tools.',
    metaDescription: 'Free online text editing and formatting tools. Edit, validate, and convert text and code formats in your browser.',
    icon: '📝',
    keywords: ['text tools', 'text editor', 'text formatter', 'code validator']
  }
};

// Tool-specific metadata
export const tools = {
  'video/info': {
    id: 'info',
    category: 'video',
    name: 'Extract Video Metadata',
    shortDescription: 'Analyze video metadata and properties.',
    description: 'Extract detailed information about your videos including resolution, codec, bitrate, and audio properties.',
    metaDescription: 'Extract metadata (codec, resolution, duration, bitrate) from MP4 and other video files. All in your browser, no uploads.',
    icon: 'ℹ️',
    keywords: ['video info', 'video metadata', 'video properties', 'video analyzer'],
    howToUse: [
      'Drop your video file into the upload area or click to select a file',
      'The tool will automatically extract and display all metadata',
      'View detailed information about video resolution, codec, framerate, and audio properties'
    ],
    useCase: 'Find out technical details about your videos before uploading, sharing, or editing them.'
  },
  'video/resize': {
    id: 'resize',
    category: 'video',
    name: 'Video Resize',
    shortDescription: 'Resize videos while maintaining quality.',
    description: 'Change the dimensions of your videos while preserving the aspect ratio and optimizing for quality.',
    metaDescription: 'Free online video resizer. Change video dimensions and resolution while maintaining quality, all processed locally in your browser.',
    icon: '📐',
    keywords: ['video resize', 'resize video', 'change video resolution', 'video dimensions'],
    howToUse: [
      'Upload your video by dropping it or selecting from your device',
      'Set the desired width and height (maintains aspect ratio by default)',
      'Click "Resize Video" to process',
      'Download the resized video when complete'
    ],
    useCase: 'Perfect for reducing video size for sharing on social media or adjusting dimensions for specific platforms.'
  },
  'video/reencode': {
    id: 'reencode',
    category: 'video',
    name: 'Video Re-encode',
    shortDescription: 'Convert videos to different formats.',
    description: 'Re-encode videos to different formats like MP4, WebM, or MOV with customizable quality settings.',
    metaDescription: 'Free online video converter. Convert videos between MP4, WebM, and MOV formats with adjustable quality settings, processed entirely in your browser.',
    icon: '🎥',
    keywords: ['video converter', 'video format converter', 'mp4 converter', 'webm converter'],
    howToUse: [
      'Upload your video using the drop area or file selector',
      'Choose your desired output format (MP4, WebM, or MOV)',
      'Select quality level and bitrate',
      'Click "Re-encode Video" to start processing',
      'Download the converted video once complete'
    ],
    useCase: 'Use when you need to convert videos to a specific format for compatibility with different devices or platforms.'
  },
  'video/gif': {
    id: 'gif',
    category: 'video',
    name: 'Video to GIF',
    shortDescription: 'Convert videos to optimized GIF animations.',
    description: 'Transform videos into GIF animations with customizable size, quality, and duration settings.',
    metaDescription: 'Free online video to GIF converter. Create optimized GIF animations from video files with custom settings, all processed locally in your browser.',
    icon: '🎞️',
    keywords: ['video to gif', 'gif maker', 'convert video to gif', 'create gif from video'],
    howToUse: [
      'Upload your video file',
      'Set the dimensions, framerate, and duration for your GIF',
      'Adjust quality settings to balance file size and appearance',
      'Click "Create GIF" to convert',
      'Download your new GIF animation'
    ],
    useCase: 'Perfect for creating shareable animations for social media, forums, or messaging apps from your videos.'
  }
};

/**
 * Get full tool metadata by path
 * @param {string} path - Tool path (category/id)
 * @returns {Object} Tool metadata
 */
export function getToolMetadata(path) {
  return tools[path] || null;
}

/**
 * Get category metadata
 * @param {string} categoryId - Category ID
 * @returns {Object} Category metadata
 */
export function getCategoryMetadata(categoryId) {
  return categories[categoryId] || null;
}

/**
 * Generate HTML metadata tags for a tool or category
 * @param {string} path - Path (category or category/tool)
 * @returns {string} HTML metadata tags
 */
export function generateMetaTags(path) {
  const parts = path.split('/').filter(p => p);
  
  // Default metadata for home page
  let title = 'SafeWebTool - Online Privacy-First Tools';
  let description = 'Free browser-based tools for working with videos, images, and text. No uploads - all processing happens locally in your browser.';
  let keywords = ['online tools', 'privacy tools', 'browser tools', 'no upload tools'];
  
  if (parts.length > 0) {
    const categoryId = parts[0];
    const category = getCategoryMetadata(categoryId);
    
    if (category) {
      if (parts.length === 1) {
        // Category page
        title = `${category.name} | SafeWebTool`;
        description = category.metaDescription;
        keywords = category.keywords;
      } else if (parts.length === 2) {
        // Tool page
        const toolId = parts[1];
        const toolPath = `${categoryId}/${toolId}`;
        const tool = getToolMetadata(toolPath);
        
        if (tool) {
          title = `${tool.name} | SafeWebTool`;
          description = tool.metaDescription;
          keywords = tool.keywords;
        }
      }
    }
  }
  
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords.join(', ')}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://safewebtool.com${path === '/' ? '' : path}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
  `;
}

/**
 * Generate structured data for tools (JSON-LD)
 * @param {string} path - Tool path (category/id)
 * @returns {string} JSON-LD structured data
 */
export function generateStructuredData(path) {
  const tool = getToolMetadata(path);
  if (!tool) return '';
  
  const category = getCategoryMetadata(tool.category);
  if (!category) return '';
  
  const baseUrl = 'https://safewebtool.com';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${tool.name} | SafeWebTool`,
    "description": tool.metaDescription,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": `${baseUrl}/${tool.category}/${tool.id}`
  };
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(structuredData, null, 2)}
    </script>
  `;
} 