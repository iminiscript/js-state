# Modal Dialog Component - Complete Documentation

## Table of Contents
- [Overview](#overview)
- [Core Components](#core-components)
- [Usage Patterns](#usage-patterns)
- [Available Click Methods](#available-click-methods)
- [Real-World Examples](#real-world-examples)
- [CSS Classes and Styling](#css-classes-and-styling)
- [Advanced Features](#advanced-features)
- [How to Use in Your Code](#how-to-use-in-your-code)
- [API Reference](#api-reference)
- [Key Benefits](#key-benefits)

## Overview

The Modal Dialog system in this codebase is built around a custom `DialogComponent` class that extends a base `Component` class. It provides a robust, accessible modal dialog system with multiple usage patterns for modals, drawers, popups, and overlays.

## Core Components

### 1. DialogComponent Class (`assets/dialog.js`)

The main dialog component that handles:

- **Opening/Closing**: `showDialog()`, `closeDialog()`, `toggleDialog()`
- **Event Handling**: Click outside to close, Escape key to close
- **Scroll Lock**: Prevents background scrolling when modal is open
- **Responsive Behavior**: Auto-closes on window resize if outside min/max width
- **Animation Support**: Built-in opening/closing animations

#### Key Methods:
```javascript
showDialog()           // Opens the dialog
closeDialog()          // Closes the dialog
toggleDialog()         // Toggles dialog open/closed
```

#### Properties:
```javascript
minWidth               // Minimum width constraint
maxWidth               // Maximum width constraint
refs.dialog            // Reference to the dialog element
```

### 2. Component Base Class (`assets/component.js`)

Provides:

- **Refs System**: Automatic element references via `ref` attributes
- **Event Delegation**: Declarative event handling with `on:click` syntax
- **Lifecycle Management**: `connectedCallback()`, `disconnectedCallback()`

## Usage Patterns

### 1. Basic Modal Structure

```html
<script src="{{ 'dialog.js' | asset_url }}" type="module"></script>

<dialog-component>
  <!-- Trigger Button -->
  <button on:click="/showDialog">Open Modal</button>
  
  <!-- Dialog Content -->
  <dialog ref="dialog" class="dialog-modal" scroll-lock>
    <button ref="closeButton" on:click="/closeDialog">Close</button>
    <!-- Modal content here -->
  </dialog>
</dialog-component>
```

### 2. Drawer Structure

```html
<dialog-component>
  <button on:click="/showDialog">Open Drawer</button>
  
  <dialog ref="dialog" class="dialog-drawer dialog-modal" scroll-lock>
    <button ref="closeButton" on:click="/closeDialog">Close</button>
    <!-- Drawer content -->
  </dialog>
</dialog-component>
```

## Available Click Methods

### Opening Methods:
- `on:click="/showDialog"` - Opens the dialog
- `on:click="/toggleDialog"` - Toggles dialog open/closed

### Closing Methods:
- `on:click="/closeDialog"` - Closes the dialog
- `on:click="/closeDialogOnClickOutside"` - Closes when clicking outside
- `on:click="/closeDialogOnEscapePress"` - Closes on Escape key

### Cross-Component Methods:
- `on:click="#modal-id/showDialog"` - Opens specific modal by ID
- `on:click="dialog-component/closeDialog"` - Closes any dialog component

## Real-World Examples

### 1. Search Modal (`snippets/search-modal.liquid`)

```html
<dialog-component id="search-modal" class="search-modal">
  <dialog 
    ref="dialog" 
    on:click="/closeDialogOnClickOutside" 
    on:keydown="/closeDialogOnEscapePress" 
    class="search-modal__content dialog-modal" 
    scroll-lock
  >
    <button ref="closeButton" on:click="/closeDialog">
      <span class="svg-wrapper">
        {{- 'icon-close.svg' | inline_asset_content -}}
        Close ICON
      </span>
    </button>
    
    {% render 'predictive-search',
      input_id: 'cmdk-input',
      search_test_id: 'search-component--modal',
      products_test_id: 'products-list-default--modal'
    %}
  </dialog>
</dialog-component>
```

### 2. Cart Drawer (`snippets/cart-drawer.liquid`)

```html
<cart-drawer-component class="cart-drawer" auto-open>
  <button 
    class="button header-actions__action button-unstyled"
    on:click="/open"
    aria-label="{{ 'accessibility.open_cart_drawer' | t }}"
  >
    {% render 'cart-icon-component' %}
  </button>

  <dialog 
    ref="dialog"
    class="cart-drawer__dialog dialog-modal dialog-drawer color-{{ settings.drawer_color_scheme }}"
    scroll-lock
  >
    <button 
      ref="closeButton"
      on:click="cart-drawer-component/close"
      class="button close-button cart-drawer__close-button button-unstyled"
    >
      <span class="svg-wrapper">
        {{- 'icon-close.svg' | inline_asset_content -}}
      </span>
    </button>
    
    <!-- Cart content -->
  </dialog>
</cart-drawer-component>
```

### 3. Popup Link Block (`blocks/popup-link.liquid`)

```html
<dialog-component class="popup-link">
  <button 
    on:click="/showDialog"
    class="button button-unstyled popup-link__button text-left spacing-style"
  >
    {{- block_settings.heading }}
    {{- 'icon-external.svg' | inline_asset_content -}}
  </button>

  <dialog 
    ref="dialog"
    class="popup-link__content dialog-modal color-{{ settings.popover_color_scheme }}"
    scroll-lock
  >
    <div class="popup-link__inner">
      {% content_for 'blocks' %}
    </div>
    
    <button 
      ref="closeButton"
      on:click="/closeDialog"
      class="button button-unstyled close-button popup-link__close"
    >
      {{- 'icon-close.svg' | inline_asset_content -}}
    </button>
  </dialog>
</dialog-component>
```

### 4. Quick Add Modal (`snippets/quick-add-modal.liquid`)

```html
<quick-add-dialog id="quick-add-dialog">
  <dialog 
    class="quick-add-modal dialog-modal color-{{ settings.popover_color_scheme }}"
    ref="dialog"
    scroll-lock
  >
    <button 
      ref="closeButton"
      on:click="/closeDialog"
      class="button button-unstyled close-button quick-add-modal__close"
    >
      {{- 'icon-close.svg' | inline_asset_content -}}
    </button>
    
    <div id="quick-add-modal-content" class="quick-add-modal__content"></div>
  </dialog>
</quick-add-dialog>
```

## CSS Classes and Styling

### Core Classes:

#### Modal Classes:
- `.dialog-modal` - Standard modal styling with backdrop
- `.dialog-drawer` - Side drawer styling
- `.dialog-drawer--right` - Right-side drawer variant
- `.dialog-closing` - Applied during close animation

#### Responsive Behavior:
- **Desktop**: Centered modal with backdrop and border radius
- **Mobile**: Full-screen modal (100dvh × 100dvw)
- **Drawer Mode**: Slides in from left/right side

#### CSS Variables:
```css
--dialog-drawer-opening-animation: slideInLeft;
--dialog-drawer-closing-animation: slideOutLeft;
--dialog-drawer-opening-animation: slideInRight; /* for right drawer */
--dialog-drawer-closing-animation: slideOutRight; /* for right drawer */
```

### Animation Classes:
- `elementSlideInTop` - Opening animation
- `elementSlideOutTop` - Closing animation
- `backdropFilter` - Backdrop animation
- `modalSlideInTop` - Custom modal opening
- `modalSlideOutTop` - Custom modal closing

## Advanced Features

### 1. Custom Dialog Components

You can extend `DialogComponent` for specialized behavior:

```javascript
class CartDrawerComponent extends DialogComponent {
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(CartAddEvent.eventName, this.#handleCartAdd);
  }

  #handleCartAdd = () => {
    if (this.hasAttribute('auto-open')) {
      this.showDialog();
    }
  };

  open() {
    this.showDialog();
    // Custom logic here
  }
  
  close() {
    this.closeDialog();
  }
}
```

### 2. Event System

The dialog dispatches custom events:

```javascript
// Dialog open event
this.dispatchEvent(new DialogOpenEvent());

// Dialog close event  
this.dispatchEvent(new DialogCloseEvent());

// Event names
DialogOpenEvent.eventName  // 'dialog:open'
DialogCloseEvent.eventName // 'dialog:close'
```

### 3. Responsive Constraints

Set min/max width constraints for responsive behavior:

```html
<dialog-component 
  dialog-active-min-width="768" 
  dialog-active-max-width="1200"
>
  <!-- Dialog content -->
</dialog-component>
```

### 4. Scroll Lock

The `scroll-lock` attribute prevents background scrolling:

```html
<dialog scroll-lock>
  <!-- Dialog content -->
</dialog>
```

### 5. Auto-Open Functionality

Components can auto-open based on events:

```html
<cart-drawer-component auto-open>
  <!-- Will open automatically when cart items are added -->
</cart-drawer-component>
```

## How to Use in Your Code

### 1. Create a Simple Modal:

```html
<script src="{{ 'dialog.js' | asset_url }}" type="module"></script>

<dialog-component id="my-modal">
  <button on:click="/showDialog">Open Modal</button>
  
  <dialog ref="dialog" class="dialog-modal" scroll-lock>
    <h2>Modal Title</h2>
    <p>Modal content goes here</p>
    <button ref="closeButton" on:click="/closeDialog">Close</button>
  </dialog>
</dialog-component>
```

### 2. Open Modal from External Button:

```html
<button on:click="#my-modal/showDialog">Open My Modal</button>
```

### 3. Create a Drawer:

```html
<dialog-component>
  <button on:click="/showDialog">Open Drawer</button>
  
  <dialog ref="dialog" class="dialog-drawer dialog-modal" scroll-lock>
    <button ref="closeButton" on:click="/closeDialog">Close</button>
    <!-- Drawer content -->
  </dialog>
</dialog-component>
```

### 4. Create a Right-Side Drawer:

```html
<dialog-component>
  <button on:click="/showDialog">Open Right Drawer</button>
  
  <dialog ref="dialog" class="dialog-drawer dialog-drawer--right dialog-modal" scroll-lock>
    <button ref="closeButton" on:click="/closeDialog">Close</button>
    <!-- Drawer content -->
  </dialog>
</dialog-component>
```

### 5. Cross-Component Communication:

```html
<!-- Modal definition -->
<dialog-component id="product-modal">
  <dialog ref="dialog" class="dialog-modal" scroll-lock>
    <!-- Modal content -->
  </dialog>
</dialog-component>

<!-- Button to open modal from anywhere -->
<button on:click="#product-modal/showDialog">View Product</button>
```

## API Reference

### DialogComponent Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `showDialog()` | Opens the dialog | None | void |
| `closeDialog()` | Closes the dialog | None | Promise<void> |
| `toggleDialog()` | Toggles dialog state | None | void |

### DialogComponent Properties

| Property | Type | Description |
|----------|------|-------------|
| `minWidth` | number | Minimum width constraint |
| `maxWidth` | number | Maximum width constraint |
| `refs.dialog` | HTMLDialogElement | Reference to dialog element |

### Event Handlers

| Event | Method | Description |
|-------|--------|-------------|
| `click` | `#handleClick` | Closes dialog when clicking outside |
| `keydown` | `#handleKeyDown` | Closes dialog on Escape key |
| `resize` | `#handleResize` | Auto-closes if outside width constraints |

### Custom Events

| Event Name | Description | Data |
|------------|-------------|------|
| `dialog:open` | Fired when dialog opens | None |
| `dialog:close` | Fired when dialog closes | None |

## Key Benefits

1. **Accessibility**: Built-in keyboard navigation and ARIA support
2. **Responsive**: Automatically adapts to different screen sizes
3. **Animation**: Smooth open/close transitions with CSS animations
4. **Event System**: Custom events for easy integration
5. **Scroll Management**: Prevents background scrolling when modal is open
6. **Declarative**: Easy to use with `on:click` syntax
7. **Extensible**: Can be extended for custom behavior
8. **Cross-Component**: Can control dialogs from anywhere in the DOM
9. **Performance**: Efficient event handling and cleanup
10. **Flexible**: Supports both modals and drawers

## File Structure

```
assets/
├── dialog.js              # Main dialog component
├── component.js           # Base component class
├── cart-drawer.js         # Extended dialog for cart
└── base.css              # Dialog styling

snippets/
├── search-modal.liquid    # Search modal implementation
├── cart-drawer.liquid     # Cart drawer implementation
├── quick-add-modal.liquid # Quick add modal
└── account-drawer.liquid  # Account drawer

blocks/
├── popup-link.liquid      # Popup link block
└── filters.liquid         # Filters with drawer
```

## Browser Support

- Modern browsers with native `<dialog>` element support
- Fallback support for older browsers via polyfills
- Mobile-responsive design
- Touch-friendly interactions

---

*This documentation covers the complete Modal Dialog system implementation in the codebase. For specific implementation details, refer to the source files mentioned in each section.*
