A Tool module follows the following format:

    {  
      icon: string,  
      name: string,  
      preview: null,  
      exportSketchCallback: null,  
      drawPreview: function(context),  
      subMenu: null,  
      events: {  
        'eventname': function(evt),  
        ...  
      }
    }
## icon
A string representing the path to the image source that appears in the toolbar.
## name
The tool's name- it must be unique as it also acts as an identifier.
## preview
The currently in-progress drawable item. It will remain null in the declaration and be populated by the events.
## exportSketchCallback
The callback function called when a finalized sketch is exported. This will remain null in the declaration and be populated by the Toolbar module. It is called by events.
## drawPreview
A function to draw the in-progress drawable item contained in 'preview'. If null, the Toolbar module will attempt to draw the preview sketch with no other parameters.
## subMenu
An optional submenu to be enabled whenever the tool is in use
## events
A dictionary of event handlers. Tool event handlers follow two formats: raw event handlers (usually for mouse or touchpad events) or override events (for undo, redo, escape, etc).

Raw handlers are passed directly from the DOM through the Toolbar module, which has a list of valid events for handling by tools. They expect an appropriate DOM event as an argument, and return a boolean on if an action was performed which causes the canvas to be redrawn.

Override handlers are called programmatically by other modules. They usually don't take an argument, and return a boolean for whether or not the action was 'valid' in this context- if not, the event is expected to be handled by another module.