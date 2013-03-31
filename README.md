Gallerie - A JQuery Gallery Plugin
===========

Gallerie is a simple JQuery plugin that offers a basic lightbox-like gallery viewer of a collection of images. It features a simple overlay with a scrollable thumbnail list, image loading hint, as well as an image caption and index. The thumbnails automatically scroll with as with the user's mouse and can be activate by click or custom event. Several methods exist to allow for extending the function with richer functionality through javascript.

Usage
===========
You can use gallerie by simply calling it on your existing collection of 
thumbnail links.
```javascript
$(document).ready(function(){
	$('#gallery').gallerie();
});
```

Where you have your thumbnail images linked to originals in HTML:
```html
<div id="gallery">
	<a href="/images/myimage.png"><img src="/thumbs/myimage-thumb.png"/></a>
	<a href="/images/second.png"><img src="/thumbs/second_thumb.png"/></a>
	<a href="/other/facephoto.jpg"><img src="/other/thumb-facephoto.jpg"/></a>
	<a href="/images/cat.jpg"><img src="/images/cat.jpg"/></a>
</div>
```
You can see [example.html](https://github.com/patiek/gallerie/blog/example.html) for a basic example.

Gallerie supports jQuery-style chaining.


## Options
Gallerie features several options that can be set at initialization or using the `.gallerie('option')` method.

You can find a full description of the options below. Here is an example of setting all of the options at initialization:
```javascript
var $gallery = $('#gallery').gallerie({
	thumbboxTriggerWidth: 0.10,
	thumbboxSpeed: 0.5,
	imageEvent: 'click',
	elem: 'a',
	wrapAround: true
});
```

### elem
#### .gallerie('option', 'elem': selector)
*Default: 'a'*

Sets the selector that gallerie will use to find anchor elements for images. Gallerie will look use the href attribute of items it finds with this selector as the original image to display in gallerie. It assumes there is an img element inside of the anchor that contains the thumbnail (see [example.html](https://github.com/patiek/gallerie/blog/example.html)).

**NOTE: setting elem using the option method may not have desired effect until you call `.gallerie('load')` method**

```javascript

// typically we set this at initialization, not using option
// only attach to links that have gallery-image class
var $gallery = $('#gallery').gallerie({
	elem: 'a.gallerie-image'
});
```

### wrapAround
#### value: boolean
*Default: true*

If set to true, the thumbbox will automatically warp around to the front or end of the list when calling next or previous methods, or when the user advances using keyboard input LEFT and RIGHT keys.

```javascript
var $gallery = $('#gallery');

// disable wrapAround
$gallery.gallerie('option', 'wrapAround', false);
```


### thumbboxTriggerWidth
#### value: number
*Default: 0.10*

Sets the width of the edges of the thumbnail box in the overlay that will cause the thumbnail box to begin to scroll. A value greater than or equal to 1 is assumed to be in pixels. A value of less than 1 is assumed to be a percentage of the total width of the page. Thus, the value 125 will set a 125px width on both sides of the thumbox that will cause the thumbbox to scroll in that direction when the user hovers over the 125px area. A value of 0.10 will set the width to be 10% of the total window width.
```javascript
var $gallery = $('#gallery');

// change trigger width to be 100 pixels
$gallery.gallerie('option', 'thumbboxTriggerWidth', 100);
```

### thumbboxSpeed
#### value: number
*Default: 0.5*

Sets the speed of the thumbbox scroll. This value starts at 0 (no movement) with higher values causing faster movement. You can try increasing/decreasing this value by 0.25 at a time until you are satisfied.
```javascript
var $gallery = $('#gallery');

// change thumbbox scroll speed to be fast
$gallery.gallerie('option', 'thumbboxSpeed', 2.0);
```

### imageEvent
#### value: string
*Default: 'click'*

Sets the event on gallery elements that will cause gallerie to open. Accepts standard jquery event types such as `'click'`, `'hover'`, and `'dblclick'`.
```javascript
var $gallery = $('#gallery');

// open gallerie on hover event (because we like to annoy users)
$gallery.gallerie('option', 'imageEvent', 'hover');
```



## Methods
Gallerie features several useful methods that you can call from your own javascript to extend its abilities:

### close
The close method will close the gallery overlay.

#### .gallerie('close')
```javascript
var $gallery = $('#gallery');

// close the gallery
$gallery.gallerie('close');
```


### isOpen
Returns true or false indicating whether gallerie is open or closed, respectively. 

#### .gallerie('isOpen')
```javascript
var $gallery = $('#gallery');

// only advance image if gallerie is open
if ($gallery.gallerie('isOpen')) {
	$gallery.gallerie('next');
}
```


### load
The load method can be used to re-load images in the gallery and is useful if you have programatically changed your images after initializing gallerie. Note that images are automatically loaded upon initialization and this method only needs to be called if your images have been modified since first calling `.gallerie()`.

#### .gallerie('load')
#### .gallerie('load', element)
The element is the link anchor element that you want to search for and consider as the base of your original image, such as `'a'`. If you do not specify an element, gallerie will use the elem specified during its initialization.

```javascript
var $gallery = $('#gallery');

// perhaps we load another image into our gallery
$image = $('<a href="extra-image.jpg"><img src="extra-image-thumb.jpg" /></a>');
$gallery.append($image);

// reload the gallery data
$gallery.gallerie('load');
```



### next
Sets the selected image to the next image in the gallery. If `wrapAround` option is enabled, the next method will wrap around to the beginning of the list after reaching the last image. 

#### .gallerie('next')
```javascript
var $gallery = $('#gallery');

Go to the next image
$gallery.gallerie('next');
```



### open
The open method will display the gallery overlay.

#### .gallerie('open')
```javascript
var $gallery = $('#gallery');

// open the gallery
$gallery.gallerie('open');
```

#### .gallerie('open', url|elem|index)
The open tag accepts an optional argument similar to setImage method.
```javascript
var $gallery = $('#gallery');

// open the gallery to the 4th image
$gallery.gallerie('open', 4);
```



### option
The option method allows you to get or set one or more options. It works similar to JQuery UI's option methods.

See options for the various options available.

#### .gallerie('option', key)
Gets the value of the option key.
```javascript
var $gallery = $('#gallery');

// What is our thumbbox trigger width?
var triggerWidth = $gallery.gallerie('option', 'wrapAround');
alert('thumbboxTriggerWidth is ' + triggerWidth);

```

#### .gallerie('option', key, value)
Sets the value of the option key to value.
```javascript
var $gallery = $('#gallery');

// disable wrap-around
$gallery.gallerie('option', 'wrapAround', false);
```

#### .gallerie('option', options)
Sets the values of the option keys found in options object to values in options object.
```javascript
var $gallery = $('#gallery');

// disable wrap-around and make scrolling fast
$gallery.gallerie('option', {'wrapAround', false, 'thumbboxSpeed': 2.0});
```



### previous
Sets the selected image to the previous image in the gallery. If `wrapAround` option is enabled, the previous method will wrap around to the end of the list after reaching the first image. 

#### .gallerie('previous')
```javascript
var $gallery = $('#gallery');

Go to the previous image
$gallery.gallerie('previous');
```



### setImage
The set image method will set the image displayed in the gallerie. If the gallerie is open, the thumbnail box will automatically scroll to this image. If the gallerie is closed, it will open to this image when you open it.
 
The setImage method can accept different argument types including a url, an html element, or the index position of a gallery image.

#### .gallerie('setImage', url)
```javascript
var $gallery = $('#gallery');

// load the image from gallery that matches the url
$gallery.gallerie('setImage', 'http://example.com/images/my-image.png');
```
#### .gallerie('setImage', elem)
```javascript
var $gallery = $('#gallery');

// load the first image from gallery with class="facephotos"
var target = $gallery.find('a.facephotos:first')[0];
$gallery.gallerie('setImage', target);
```
#### .gallerie('setImage', index)
```javascript
var $gallery = $('#gallery');

// load the 4th image from gallery
$gallery.gallerie('setImage', 4);
```

