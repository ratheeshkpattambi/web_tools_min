# Button Design System

## Color-Coded Button Hierarchy

### **Primary Blue** (`bg-blue-600 hover:bg-blue-700`)
- **Usage**: Main actions, file selection, processing
- **Examples**: "Select File", "Process", "Validate", "Format"
- **Purpose**: Most common user actions
- **Classes**: `px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium`
- **File Selection**: Add `file-select-btn` class for file upload functionality

### **Success Green** (`bg-green-600 hover:bg-green-700`) 
- **Usage**: Download, export, save actions
- **Examples**: "Download", "Download Metadata", "Save File"
- **Purpose**: Actions that result in getting/saving content
- **Classes**: `px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium`

### **Warning Yellow** (`bg-yellow-600 hover:bg-yellow-700`)
- **Usage**: Potentially destructive actions that are reversible
- **Examples**: "Clear", "Reset", "Minify" (reduces data)
- **Purpose**: Actions that modify/remove data but can be undone
- **Classes**: `px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium`

### **Danger Red** (`bg-red-600 hover:bg-red-700`)
- **Usage**: Destructive actions that cannot be undone
- **Examples**: "Delete", "Remove", "Cancel Upload"
- **Purpose**: Permanent destructive actions
- **Classes**: `px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium`

### **Secondary Gray** (`bg-slate-600 hover:bg-slate-700`)
- **Usage**: Secondary actions, copy functions
- **Examples**: "Copy", "Copy to Clipboard", "Back"
- **Purpose**: Supporting actions
- **Classes**: `px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-medium`

## Button Size Hierarchy

### **Full-Width Primary** (`w-full`)
- **Usage**: Main processing buttons in video/image tools
- **Examples**: "Resize Image", "Trim Video", "Create GIF"
- **Layout**: Use when button should span full container width
- **Classes**: `w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-md shadow-sm transition-colors`

### **Standard Action** (`px-6 py-2` or `px-4 py-2`)
- **Usage**: Regular action buttons
- **Examples**: "Validate", "Format", "Convert"
- **Layout**: Use in button groups or standalone
- **Classes**: `px-6 py-2` for primary, `px-4 py-2` for secondary

### **Icon Buttons** (`p-1.5`)
- **Usage**: Small utility buttons with icons
- **Examples**: Clear (❌), Upload (📁), Copy (📋)
- **Layout**: Use in toolbars or alongside inputs
- **Classes**: `p-1.5 rounded hover:bg-slate-200 text-slate-600` (gray) or `p-1.5 rounded bg-yellow-600 hover:bg-yellow-700 text-white` (destructive)

## Disabled State
- **Classes**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Usage**: Add to any button that can be disabled

## Complete Class Templates

```css
/* Primary Full-Width */
w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors

/* Primary Action */
px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium

/* File Selection Button */
file-select-btn px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium

/* Download Action */
px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium

/* Secondary Action */
px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed

/* Destructive Action */
px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium

/* Icon Button (Neutral) */
p-1.5 rounded hover:bg-slate-200 text-slate-600

/* Icon Button (Destructive) */
p-1.5 rounded bg-yellow-600 hover:bg-yellow-700 text-white
```

## Usage Guidelines

1. **One primary action per section**: Use full-width primary for main tool function
2. **Group related actions**: Place similar actions together with consistent sizing
3. **Color consistency**: Always use the same color for the same type of action across tools
4. **Icon consistency**: Use consistent icons (❌ for clear, 📁 for upload, 📋 for copy, 💾 for download)
5. **Disabled states**: Always include disabled styles for buttons that can be disabled 