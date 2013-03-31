/*
Gallerie - A JQuery Gallery Plugin
Copyright (c) 2013 Patrick Brown
web: http://browniethoughts.com/

Released under MIT LICENSE 
*/

(function($) {
	
	$.fn.gallerie = function (method) {
		
		var plugindata;
		
		function rebuildOverlay(target, imageLinks){
			var $this = $(target),
				options = $this.data('gallerie')['options'],
				$overlay = $('<div class="gallerie-overlay"/>'),
				$imageBox = $('<div class="gallerie-imagebox"/>'),
				$image = $('<img class="gallerie-image"/>'),
				$imageLoading = $('<div class="gallerie-loading"/>'),
				$captionBox = $('<div class="gallerie-captionbox"><div class="gallerie-title"/><div class="gallerie-index"/></div>'),
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
		
			var scrollHover = 0;
			$thumbBox.mousemove(function(event){
			
				var triggerWidth = options['thumbboxTriggerWidth'],
					thumbboxWidth = $thumbList.outerWidth();
			
				// adjust triggerWidth to pixels if it is a percentage
				if (triggerWidth < 1)
						triggerWidth = $(window).width() * triggerWidth;
			
				var oldHover = scrollHover;
				if (event.pageX < triggerWidth) {
					scrollHover = 0;
				} else if ($(window).width() - event.pageX < triggerWidth) {
					scrollHover = 1;
				} else {
					scrollHover = -1;
				}
			
				if (oldHover != scrollHover) {
					$thumbList.clearQueue().stop();
				
					if (scrollHover < 0)
						return;
					
					var oldLeft = parseInt($thumbList.css('left'),10);
					var newLeft = -(scrollHover * thumbboxWidth) + ($(window).width() * scrollHover);
					var travelAmount = Math.abs(newLeft - oldLeft);
					
					$thumbList.animate({
						left: newLeft
					},{
						duration: travelAmount * 1/options['thumbboxSpeed'],
						easing: 'linear'
					});
				}

			}).mouseleave(function(event){
				$thumbList.clearQueue().stop();
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
					
					var $this = $(this);
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
					
					// load the target image
					$image.prop({
						src: $imageLink.prop('href'),
						title: $imageLink.find('img').prop('title')
					}).load(function(){
						// hide image loading after we have loaded target
						$imageLoading.hide();
					});
					
					// if image hasn't loaded (not from cache, begin imageLoading display process)
					if (!$image.prop('complete')) {
					
						// give loading image 250ms to load before showing imageLoading
						setTimeout(function(){
							// show image loading if image still not loaded
							if (!$image.prop('complete')) {
								$imageLoading.show();
								
								// hide image loading if target already loaded while showing imageLoading
								if ($image.prop('complete')) {
									$imageLoading.hide();
								}
							}
						}, 250);
					}
					
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
					
					var thumbpos = $targetThumb.offset().left - $targetThumb.outerWidth()/2,
						winwidth = $(window).width();
					
					if ($targetThumb.offset().left < 0 || $targetThumb.offset().left > winwidth - $targetThumb.outerWidth()) {
						// calculate new left edge of thumblist
						var newLeft = -(winwidth/2 - $targetThumb.outerWidth()/2 - $targetThumb.position().left);
						
						// if edge is beyond normal scrolling bounds, bring it to within bounds
						newLeft = Math.max(0, newLeft);
						newLeft = Math.min($thumbList.outerWidth() - winwidth, newLeft);
						
						// clear queue of effects (otherwise backlog happens when user advances quickly)
						$thumbList.clearQueue();
						
						// animate scroll to the position
						$thumbList.animate({
							left: -newLeft
						}, 1000);
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
						$overlay = $this.find('.gallerie-overlay');
					
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
