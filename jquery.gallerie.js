/*
Gallerie - A JQuery Gallery Plugin
Copyright (c) 2013 Patrick Brown
web: http://browniethoughts.com/

Released under MIT LICENSE 
*/

;(function($) {

	var _body = document.body || document.documentElement,
		_style = _body.style,
		_transition,
		_transform;
		
	// detect support for transition		
	if (_style.transition !== undefined) {
		_transition = 'transition';
	} else if (_style.WebkitTransition !== undefined) {
		_transition = '-webkit-transition';
	} else if (_style.MozTransition !== undefined) {
		_transition = '-moz-transition';
	} else if (_style.MsTransition !== undefined) {
		_transition = '-ms-transition';
	} else if (_style.OTransition !== undefined) {
		_transition = '-o-transition';
	}
	
	// detect support for transform
	if (_style.transform !== undefined) {
		_transform = 'transform';
	} else if (_style.WebkitTransform !== undefined) {
		_transform = '-webkit-transform';
	} else if (_style.MozTransform !== undefined) {
		_transform = '-moz-transform';
	} else if (_style.MsTransform !== undefined) {
		_transform = '-ms-transform';
	} else if (_style.OTransform !== undefined) {
		_transform = '-o-transform';
	}
	
	$.fn.gallerie = function (method) {
		
		function rebuildOverlay(target, imageLinks){
			var $this = $(target),
				options = $this.data('gallerie')['options'],
				$overlay = $('<div class="gallerie-overlay"/>'),
				$imageBox = $('<div class="gallerie-imagebox"/>'),
				$image = $('<img class="gallerie-image"/>'),
				$imageLoading = $('<div class="gallerie-loading"/>'),
				$captionBox = $('<div class="gallerie-captionbox"><div class="gallerie-control gallerie-control-previous">&laquo;</div><div class="gallerie-text"><div class="gallerie-title"/><div class="gallerie-index"/></div><div class="gallerie-control gallerie-control-next">&raquo;</div></div>'),
				$thumbList = $('<ul></ul>'),
				$thumbBox = $('<div class="gallerie-thumbbox"/>'),
				$thumbItem,
				$imageLink;
			
			$.each(imageLinks, function(index, imageLink) {
			
				$imageLink = $(imageLink);
				$thumbItem = $(imageLink).find('img');
			
				// listbox thumbs
				$thumbItem = $('<li></li>')
							.append(
								$('<a />').prop({
									href: $imageLink.prop('href')
								}).append(
									$('<img/>').prop({
										src: $thumbItem.prop('src'),
										title: $thumbItem.prop('title') 
									})
								)
							);
				$thumbList.append($thumbItem);
			});
			
			$overlay.append($imageBox.append($image).append($imageLoading))
					.append($captionBox)
					.append($thumbBox.append($thumbList));
					
					
			$overlay.on('click.gallerie', function(event){
				$this.gallerie('close');
			});
			
			$overlay.on('click.gallerie', '.gallerie-control-previous', function(event){
				$this.gallerie('previous');
				return false;
			});
			
			$overlay.on('click.gallerie', '.gallerie-control-next', function(event){
				$this.gallerie('next');
				return false;
			});
		
		
			var scrollHover = 0;
			
			$thumbBox.mousemove(function(event){
			
				var triggerWidth = options['thumbboxTriggerWidth'],
					thumbboxWidth = $thumbList.outerWidth(),
					windowWidth = $(window).width();
			
				// adjust triggerWidth to pixels if it is a percentage
				if (triggerWidth < 1)
						triggerWidth = windowWidth * triggerWidth;
			
				var oldHover = scrollHover;
				if (event.pageX < triggerWidth) {
					scrollHover = 0;
				} else if (windowWidth - event.pageX < triggerWidth) {
					scrollHover = 1;
				} else {
					scrollHover = -1;
				}
			
				if (oldHover != scrollHover) {
				
					scrollStop($thumbList);
				
					if (scrollHover < 0)
						return;
						
					var oldLeft=0,
						newLeft,
						travelAmount;
					
					
					if (_transform !== undefined && _transition !== undefined) {
						// get current transform
						var matrix = $thumbList.css(_transform),
						marray = matrixToArray(matrix);
						if (marray.length > 4) {
							oldLeft = parseInt(marray[4]);
						}
						
					} else {
						oldLeft = parseInt($thumbList.css('left'),10);
					}
					
					newLeft = -(scrollHover * thumbboxWidth) + (windowWidth * scrollHover);
					travelAmount = Math.abs(newLeft - oldLeft);
					
					scrollAnimate($thumbList, newLeft, {
						duration: travelAmount * 1/options['thumbboxSpeed'],
						easing: 'linear'
					});
				}

			}).mouseleave(function(event){
				scrollStop($thumbList);
				scrollHover = -1;
			});
						
			
			$overlay.find('.gallerie-thumbbox li').on('click.gallerie', function(event){
				var imageLink = $(this).find('a:first')[0];
				$this.gallerie('open', imageLink);
				event.preventDefault();
				event.stopPropagation();
				
			}).hover(function(){
				$(this).addClass('gallerie-thumbbox-hover');
			}, function(){
				$(this).removeClass('gallerie-thumbbox-hover');
			});
			
			// remove any old overlays
			$this.find('.gallerie-overlay').remove();
			$this.append($overlay.hide());
			
			return $overlay;
			
		}
		
		function matrixToArray(matrix) {
			var marray = matrix.substr(7, matrix.length - 8).split(',');
			return marray;
		}
		
		function scrollStop($element) {
			// transition support
			if (_transition !== undefined) {
				var css = {};
				
				// transform support
				if (_transform !== undefined) {
					// get current transform
					var matrix = $element.css(_transform),
						marray = matrixToArray(matrix);
					css[_transform] = 'translate('+marray[4]+'px)';
					css[_transition] = _transform +' 0ms';
				} else {
					css['left'] = $element.css('left');
					css[_transition] = 'left 0ms';
				}
				
				$element.css(css);
				
			}else { // jquery animations
				$element.clearQueue().stop();
			}
		}
		
		function scrollAnimate($element, leftPos, options) {
		
			// transition support
			if (_transition !== undefined) {
			
				if (options['easing'] == undefined) {
					options['easing'] = 'ease';
				}
				
				var css  = {};
				
				// transform support
				if (_transform !== undefined) {
					css[_transform] = 'translate('+leftPos+'px)';
					css[_transition] = _transform +' '+ options.duration + 'ms ' + options['easing'];
				} else {
					css['left'] = leftPos;
					css[_transition] = 'left '+ options.duration + 'ms ' + options['easing'];
				}
				
				$element.css(css);
				
			} else { // default to using jQuery's animate
				$element.animate({
					left: leftPos,
				}, options);
			}
		}
		
		function displayLoadedImage(targets) {
		
			// unwrap if target is event
			if (targets instanceof $.Event) {
				targets = targets['data'];
			}
		
			var preloadImage = targets['preloadImage'],
				$image = targets['$image'],
				$imageBox = $image.closest('.gallerie-imagebox');
				$imageLoading = targets['$imageLoading'],
				maxWidth = $imageBox.width() - $image.outerWidth() + $image.width(),
				maxHeight = $imageBox.height() - $image.outerHeight() + $image.height(),
				height=0,
				width=0;
		
			if (preloadImage != $image.data('preloadImage'))
				return;
			
			// adjust width and height according to determined maxWidth
			width = preloadImage.width > maxWidth ? maxWidth : preloadImage.width;
			height = preloadImage.height * width / preloadImage.width; 
			
			// if height still too big, use maxHeight scale width & height
			if (height > maxHeight) {
				height = maxHeight;
				width = preloadImage.width * height / preloadImage.height;
			}
		
			// load the target image
			$image.prop({
				src: preloadImage.src,
				title: preloadImage.title
			}).css({
				width: width,
				height: height
			}).removeClass('loading');
	
			$imageLoading.hide();
		}
		
		// public methods
		var methods = {
				
			init : function (options) {
				
				var defaults = {
					thumbboxTriggerWidth: 0.10,
					thumbboxSpeed: 0.5,
					imageEvent: 'click',
					elem: 'a',
					wrapAround: true
				};
				
				var options =  $.extend(defaults, options);
				
				return this.each(function(){
					
					var $this = $(this),
						plugindata = $this.data('gallerie');
					
					// if plugin has not been initialized on element
					if (!plugindata) {
						
						$this.data('gallerie', {
							options: options,
							target: $this,
						});
						
						// load image data
						$this.gallerie('load', options['elem']);
						
						// set to the first image
						$this.gallerie('setImage', 1);
					}
					
				});
				
			},
			
			
			setImage: function(imageLink){
				return this.each(function(){
				
					var $this = $(this),
						options = $this.data('gallerie')['options'],
						$overlay = $this.find('.gallerie-overlay'),
						$thumbBox = $this.find('.gallerie-thumbbox'),
						$captionBox = $this.find('.gallerie-captionbox'),
						$thumbList = $thumbBox.find('ul:first'),
						linkType = $.type(imageLink),
						$imageLink,
						$image,
						preloadImage,
						$imageLoading;
					
					// if image is a number, we consider it the index of the target thumb
					if (linkType == 'number') {
						imageLink = $thumbList.find('li a')[imageLink-1];
					} else if (linkType == 'string') {
						imageLink = $('<a/>').prop('href', imageLink)[0];
					}
					
					// we assume it is a link otherwise
					$imageLink = $(imageLink);
					$image = $overlay.find('.gallerie-image');
					$imageLoading = $overlay.find('.gallerie-loading');
					
					$image.addClass('loading');
					
					// construct new image element to work-around onLoad issues with various browsers
					preloadImage = new Image();
					var targetData = {
						'preloadImage': preloadImage,
						'$image': $image,
						'$imageLoading': $imageLoading
					};
					
					// when image has loaded, call displayLoadedImage to update real image to preloadImage
					$(preloadImage).on('load.gallerie', targetData, displayLoadedImage);
					$image.data('preloadImage', preloadImage);
					preloadImage.src = $imageLink.prop('href');
					
					// give the image 250ms to load before showing imageLoading (lowers flicker chance of imageLoading)
					setTimeout(function(){
						// image still has not loaded, so we show imageLoading
						if (!preloadImage.complete) {
							$imageLoading.show();
							
							// hide image loading if target already loaded while showing imageLoading
							if (preloadImage.complete) {
								displayLoadedImage(targetData);
							}
						}
					}, 250);
					
					// attempt to find link in thumbnails
					var $thumbLink = $thumbBox.find(imageLink),
						$targetThumb;
						
					
					// could not find same link element, so we search by href
					if ($thumbLink.length == 0) {
						var imageLinkHref = $imageLink.prop('href');
						$thumbBox.find('a').each(function(index, elem) {
							if ($(elem).prop('href') == imageLinkHref) {
								$thumbLink = $(elem);
								return false;
							}
						});
					}
					
					$targetThumb = $thumbLink.closest('li');
					
					// remove selected from old thumb
					$thumbBox.find('.gallerie-thumbbox-selected').removeClass('gallerie-thumbbox-selected');
					
					// add selected to new thumb
					$targetThumb.addClass('gallerie-thumbbox-selected');
					
					var $thumbs = $thumbBox.find('li'),
						thumbPosition = $thumbs.index($targetThumb)+1,
						thumbTotal = $thumbs.length;
					
					// set caption
					$captionBox.find(".gallerie-title").text($targetThumb.find('img').prop('title'));
					$captionBox.find(".gallerie-index").text(thumbPosition + ' of ' + thumbTotal);
					
					var thumbpos = $targetThumb.position().left + $targetThumb.outerWidth(true)/2,
						winwidth = $(window).width();
					
					if ($targetThumb.offset().left < 0 || thumbpos > winwidth) {
						// calculate new left edge of thumblist
						var newLeft = -(winwidth/2 - thumbpos);
						
						// if edge is beyond normal scrolling bounds, bring it to within bounds
						newLeft = Math.max(0, newLeft);
						newLeft = Math.min($thumbList.outerWidth() - winwidth, newLeft);
						
						// clear queue of effects (otherwise backlog happens when user advances quickly)
						$thumbList.clearQueue();
						
						// animate scroll to the position
						scrollAnimate($thumbList, -newLeft, {'duration': 1000});
					}
					
					
				});
			},
			
			isOpen : function() {
				var $this = $(this[0]),
					$overlay = $this.find('.gallerie-overlay');
					
				return $overlay.is(':visible');
			},
			
			open : function(imageLink){
				return this.each(function(){
					var $this = $(this),
						options = $this.data('gallerie')['options'],
						$overlay = $this.find('.gallerie-overlay'),
						$imageBox = $this.find('.gallerie-imagebox'),
						$captionBox = $this.find('.gallerie-captionbox'),
						$thumbBox = $this.find('.gallerie-thumbbox');
					
					if ($overlay.is(':hidden')) {
						$(document).on('keyup.gallerie', function(e) {
							if (e.keyCode == 13 || e.keyCode == 27) {
								$this.gallerie('close');
							} else if (e.keyCode == 37) {
								$this.gallerie('previous');
							} else if (e.keyCode == 39) {
								$this.gallerie('next');
							}
						});
						
						// remove scrollbar from window
						$('body').css({ overflow: 'hidden' });
						
						// resize imagebox to fill void not filled by captionBox and thumbBox
						$imageBox.css({height: $overlay.height() - $captionBox.outerHeight() - $thumbBox.outerHeight() - parseInt($imageBox.css('margin-bottom'), 10) - parseInt($imageBox.css('margin-top'), 10)});
						
					}
				
					$overlay.fadeIn(500, function(){
						if (imageLink) {
							$this.gallerie('setImage', imageLink);
						}	
					});
				});
			},
			
			close : function(){
				return this.each(function(){
					$(this).find('.gallerie-overlay').hide();
					$(document).off('keyup.gallerie');
					
					// restore window scrollbar, etc
					$("body").css({ overflow: 'inherit' });
				});
			},
			
			next : function(){
				return this.each(function(){
					var $this = $(this),
						options = $this.data('gallerie')['options'],
						$thumbBox = $this.find('.gallerie-thumbbox');
						
					var $selectedItem = $thumbBox.find('.gallerie-thumbbox-selected'),
						$nextItem = $selectedItem.next();
						
					if ($nextItem.length == 0) {
						if (!options['wrapAround']) {
							return;
						}
					
						$nextItem = $thumbBox.find('li:first');
					}
					
					$this.gallerie('setImage', $nextItem.find('a'));
				});
			},
			
			previous : function(){
				return this.each(function(){
					var $this = $(this),
						options = $this.data('gallerie')['options'],
						$thumbBox = $this.find('.gallerie-thumbbox');
						
					var $selectedItem = $thumbBox.find('.gallerie-thumbbox-selected'),
						$prevItem = $selectedItem.prev();
						
					if ($prevItem.length == 0) {
						if (!options['wrapAround']) {
							return;
						}
						
						$prevItem = $thumbBox.find('li:last');
					}
					
					$this.gallerie('setImage', $prevItem.find('a'));
				});
			},
			
			load: function(elem){
				return this.each(function(){
					var $this = $(this),
						options = $this.data('gallerie')['options'];
						
					if (elem === undefined) {
						elem = options['elem'];
					}
						
					rebuildOverlay(this, $this.find(elem).toArray());
					
					$(document).on(options['imageEvent'] + '.gallerie', elem, function(e){
						$this.gallerie('open', this);
						e.stopPropagation();
						e.preventDefault();
					});
				});
			},
			
			option: function(key, value) {
				
				var newOptions = {};
				
				if (value === undefined && $.type(key) != 'string') {
					newOptions = key;
				} else if (value === undefined) {
					return $(this[0]).data('gallerie')['options'][key];
				} else {
					newOptions = {}
					newOptions[key] = value;
				}
			
				return this.each(function(){
					var $this = $(this),
						data = $this.data('gallerie'),
						options = data['options'];
					
					$.each(newOptions, function(key, value){
						if (key == 'elem' || key == 'imageEvent') {
							// unbind old events
							$(document).off(options['imageEvent'] + '.gallerie', options['elem']);
					
							// update option
							options[key] = value;
						
							// rebind with new option
							$(document).on(options['imageEvent'] + '.gallerie', options['elem'], function(e){
								$this.gallerie('open', this);
								e.stopPropagation();
								e.preventDefault();
							});
						
						} else if (key in options) {
							options[key] = value;
						}
					});
					
					data['options'] = options;
					$this.data('gallerie', data);
						
				});
			}
		};
		
		// handle accessing of public methods
		// this is essentially bootstrapping this plugin
		if ( methods[method] ) {
	      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.gallerie' );
	    }
	}
})(jQuery);
