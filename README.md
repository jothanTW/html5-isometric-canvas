# html5-isometric-canvas
This is an html5 application to provide an isometric drawing canvas, along with several tools for interacting with the grid. It is intended to be mobile-friendly but actual device compatability is WIP.

The page itself contains a Canvas element and several "Control" elements, such as the toolbar or style menues.

This app is built off ESModules and primarily uses the .mjs extension for them. These modules follow certain naming conventions-

## Core (/script/core/*.mjs)
These are class definitions used throughout the application, such as the [sketch](script/core/sketch.mjs) library of sketch types or the [loudener](script/core/loudener.mjs) implementation of a basic event emitter.

## Imports (/script/imports/*.js)
These are external libraries available as minified code files. More information on these can be found at the bottom of this readme.

## Services (/script/services/*.service.mjs)
Services are singleton objects that share information or functionality across the modules. This includes the [CommonService](script/services/common.service.mjs), which contains viewing and rendering information, and the [ObjectService](script/services/object.service.mjs), which maintains the list of drawn objects and keeps a running log of changes.

## Controls (/script/controls/*.control.mjs)
Controls are a special type of Service which tie to certain items outside of the canvas, i.e. gathering [touch](script/controls/touch.control.mjs) events, taking input from the [toolbar](script/controls/toolbar.control.mjs), or changing the [cursor](script/controls/cursor.control.mjs) depending on what state the canvas is in.

## Tools (/script/tools/*.tool.mjs)
Tools provide a way to interact with the canvas, and display in the left-side toolbar control. Tool modules follow a more strict format, which is described further in [tools.md](/script/tools/tools.md). They are fully managed by the ToolbarControl module, which verifies, organizes, displays, and switches between them. The ToolbarControl module also has the ability to load modules externally, as long as they adhere to tools.md, though that is not yet available to the UI.

This software is licensed under [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt), and uses the [jscolor](https://jscolor.com/) color-picker library.