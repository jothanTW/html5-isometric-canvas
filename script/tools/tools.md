A Tool module follows the following format:

    {  
      icon: string,  
      name: string,  
      preview: null,  
      exportSketchCallback: null,  
      drawPreview: function(context),  
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
## events
A dictionary of DOM event handlers. Entries where 'eventname' matches a valid event name (click, mousedown, etc) listed in the Toolbar module will be passed those events from the canvas when this tool is active. It may also contain certain override events called by the Toolbar or Main modules, e.g. 'escape'