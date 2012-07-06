/*Copyright (c) 2012 Jonathan Yom-Tov

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

LikeButton = (function(){
	'use strict';
	var params = {
		hasFaces: false,
		hasSendButton: false,
		layout: 'standard',
		verb: 'like'
	};		
	
	function createFbmlButton(likeCallback, appId, channelFileUrl){
		loadFacebookJs(likeCallback, appId, channelFileUrl);
		if (typeof likeCallback === 'function'){
			var counter = 1,
			    fbLoadListener = setInterval(function(){
					if (window.FB){
						clearInterval(fbLoadListener);
						createLikeButtonListener(likeCallback);
					} else {
						counter++;
						if (counter > 50){
							clearInterval(fbLoadListener);
						}
					}					
				}, 200);			
		}
		
		var likeButton = document.createElement('div');
		likeButton.setAttribute('class', 'fb-like');
		likeButton.setAttribute('data-href', params.url);
		likeButton.setAttribute('data-send', params.hasSendButton);
		likeButton.setAttribute('data-width', 450);
		likeButton.setAttribute('data-show-faces', params.hasFaces);
		
		return likeButton;
	}
	
	function createIframeButton(){	
		var iframe = document.createElement('iframe');
		iframe.src = '//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(params.url) + '&send=false&layout=' + params.layout + '&width=450&show_faces=' + params.hasFaces + '&action=' + params.verb + '&colorscheme=light&font';
		iframe.style.border = 'none';
		iframe.style.overflow = 'hidden';
		iframe.style.width = '450px';
		iframe.setAttribute('scrolling', 'no');
		iframe.setAttribute('frameBorder', 0);
		iframe.setAttribute('allowTransparency', true);
		
		return iframe;	
	}
	
	function loadFacebookJs(likeCallback, appId, channelFileUrl){
		if (!window.FB){ // If the Facebook javascript SDK isn't loaded, load it
			var body = document.getElementsByTagName('body')[0],
				fbRootDivTag = document.createElement('div'),
				scriptTag = document.createElement('script');
			fbRootDivTag.id = 'fb-root';
			scriptTag.innerHTML = "\
				window.fbAsyncInit = function() {\
					FB.init({\
					  appId      : '" + appId + "', \
					  channelUrl : '" + channelFileUrl + "', \
					  status     : true, \
					  cookie     : true, \
					  xfbml      : true  \
					});\
				};\
				(function(d){\
				var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];\
				if (d.getElementById(id)) {return;}\
				js = d.createElement('script'); js.id = id; js.async = true;\
				js.src = '//connect.facebook.net/en_US/all.js';\
				ref.parentNode.insertBefore(js, ref);\
				}(document));\
			";
			
			body.appendChild(fbRootDivTag);
			body.appendChild(scriptTag);
		} 		
	}
	
	// Execute a user defined callback when a like button is clicked
	function createLikeButtonListener(likeCallback){
		var body = document.getElementsByTagName('body')[0],
			likeListenScript = document.createElement('script');
		likeListenScript.innerHTML = "\
			FB.Event.subscribe('edge.create',\
				function(response) {\
					likeCallback(response);\
				}\
			);";
		body.appendChild(likeListenScript);	
	}
	
	return {
		create: function(url, buttonParams, likeCallback, appId, channelFileUrl){ // Get all the params
			params.url = url;
			if (buttonParams !== undefined){
				if (typeof buttonParams.hasFaces === 'boolean'){
					params.hasFaces = buttonParams.hasFaces;
				}
				if (typeof buttonParams.hasSendButton === 'boolean'){
					params.hasSendButton = buttonParams.hasSendButton;
				}
				if (typeof buttonParams.layout === 'string' && ['standard', 'button_count', 'box_count'].indexOf(buttonParams.verb) > -1){
					params.layout = buttonParams.layout;
				}
				if (typeof buttonParams.verb === 'string' && ['like', 'recommend'].indexOf(buttonParams.verb) > -1){
					params.verb = buttonParams.verb;
				}
			}									
			
			// Create an IFrame if nothing fancy is needed, otherwise create an HTML5 like button
			return (params.hasSendButton || (typeof likeCallback === 'function' && typeof appId === 'number') ?
				createFbmlButton(likeCallback, appId) :
				createIframeButton()
			);			
		}
	};
}());