// ==UserScript==
// @name             Anti-Pagination
// @namespace        http://myuserjs.org/user/jgjake2
// @description      Avoid Pagination and simply load all the pages onto one page
// @author           jgjake2
// @downloadURL      http://myuserjs.org/script/jgjake2/Anti-Pagination.user.js
// @updateURL        http://myuserjs.org/script/jgjake2/Anti-Pagination.meta.js
// @homepage         http://myuserjs.org/script/jgjake2/Anti-Pagination
// @include          http://test2.myuserjs.org/API/MUJS.TEST2.html
{{{INCLUDES}}}
{{{EXCLUDES}}}
// @require          http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require          http://myuserjs.org/API/0.0.6/MUJS.js
{{{REQUIRES}}}
// @version          0.0.12
// @history          (0.0.12) Added $target to addPageContent parameters
// @history          (0.0.12) Changed mutation events to page observers
// @history          (0.0.11) Updated API version
// @history          (0.0.11) Minor script improvements
// @history          (0.0.10) Removed settings for now
// @history          (0.0.10) Updated API to gather script information and better error reporting
// @history          (0.0.9) Started outlining settings
// @history          (0.0.9) API Update
// @history          (0.0.9) Major code improvements
// @history          (0.0.9) Updated Comments
// @history          (0.0.8) Added Homepage and ReadMe updates
// @history          (0.0.7) Added script_info options to MUJS updates
// @history          (0.0.6) Added includes/excludes to build process
// @history          (0.0.5) Update API Version
// @history          (0.0.4) Upload to GitHub
// @history          (0.0.3) Clean Up code
// @history          (0.0.2) MUJS API Fixes
// @history          (0.0.1) Initial Release
{{{HISTORY}}}
// @grant            unsafeWindow
// @grant            GM_info
// @grant            GM_log
// @grant            GM_getMetadata
// @grant            GM_xmlhttpRequest
// @grant            GM_registerMenuCommand
// @unwrap
// @noframes
// ==/UserScript==

// @run-at document-start
// @require          https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js

var scriptLoadTime = -1;
try{
//console.log('GM_info', GM_info);

// Object containing information about the current script
MUJS({
	'ginfo': GM_info,
	'has_GM_info': (typeof GM_info !== "undefined" ? true : false),
	'has_GM_getMetadata': (typeof GM_getMetadata !== "undefined" ? true : false)
});

//console.log('newScriptInfo', script_info);

MUJS('set', 'script.username', 'jgjake2'); // Set Script Owner's Name
MUJS('set', 'script.script_name', 'Anti-Pagination'); // Set Script Name
MUJS('set', 'Update.getType', 'data'); // Set the update data return type
MUJS('set', 'Update.DOMTiming', true); // Enable reporting of timing information
MUJS('set', 'Error.autoReportErrors', true); // Enable reporting of timing information
//MUJS.config('Update.getStats', true);
MUJS('set', 'Update.XMLHttpRequest', true);
//MUJS.config('debug', true);

// Callback function for update check
var updateCallback = function(result){
	console.log('updateCallback ', result);
}



function getMUJSUpdate(){
	//console.log('getMUJSUpdate');
{{{DEBUG_ONLY}}}

try{
	// Create error test
	//var bar = undefined;
	//var foo = bar(taco, bell);
	var foo = eval('FAIL');
} catch(e) {
	//console.log('caught error - getMUJSUpdate', e.stack);
	MUJS.ERROR.processError(e);
}

{{{\DEBUG_ONLY}}}

	var opts = {
		callback: updateCallback,
		getType: 'data',
		args: {}
	};
	
	// Only add "scriptLoadTime" if it is valid
	if(scriptLoadTime > -1)
		opts.args.scriptLoadTime = scriptLoadTime;
		
	//console.log(MUJS.UPDATE.getURL(opts));	
	//MUJS.UPDATE.getUpdateData(opts);
{{{RELEASE_ONLY}}}
	// Initiate update check and send args to the collection engine
	MUJS.UPDATE.getUpdateData(opts);
	
{{{\RELEASE_ONLY}}}

}

// ToDo:
//     Script settings
/*try{
function openSettings(){unsafeWindow.AntiPagination.settings.show();}
GM_registerMenuCommand("Anti-Pagination Settings", openSettings, 'a');
}catch(e){}
var head = document.head;

var bs = document.createElement('link');
bs.type = 'text/css';
bs.rel = 'stylesheet';
bs.href = 'http://myuserjs.org/resource/jgjake2/Anti-Pagination/tw-bs.3.1.1.css';
head.appendChild(bs);*/
$(document).ready(function() {

	function PageTypeClass(data){
		return $.extend({
			name: undefined, // Name of page type
			init: function(currentURL, currentPageNumber, maxNumberOfPages){
				// Initialize
			},
			test: function(currentURL){
				// Check page
			},
			getCurrentPageNumber: function(currentURL){
				// Get current page number
			},
			getgetMaxNumberOfPages: function(currentURL){
				// Get the max number of pages being paginated
			},
			getCurrentPageContent: function(currentURL){
				// Get the content of the current page as a jQuery object
			},
			addPageContent: function(currentURL, currentPageNumber, contentPageNumber, $target){
				// Get and return the content from the given page number
			},
			onContentAdded: function(contentPageNumber, $content){
				// Called when content is added to one of the page wrappers
			},
			onAllPagesAdded: function(){
				// Called when content all the pages have been successfully added
			}
		}, data);
	}

	var AntiPagination = {
		
		pageTypes: {},
		
		pageObservers: {},

		currentPageType: undefined, // Page type name
		
		current: function(){
			if(typeof this.currentPageType === "undefined") return undefined;
			return this.pageTypes[this.currentPageType];
		},
		
		currentPageNumber: -1, // Current page number
		maxNumberOfPages: -1, // Maximum number of pages
		numPagesAdded: 0, // Number of pages that have been added
		
		currentURL: window.location.href,
		
		init: function(){
			
			
			this.currentPageType = this.getPageType();
			
			if(typeof this.currentPageType !== "undefined"){
				this.currentPageNumber = this.callMethod('getCurrentPageNumber', this.currentPageType, this.currentURL);
				this.maxNumberOfPages = this.callMethod('getMaxNumberOfPages', this.currentPageType, this.currentURL);
				
				this.callMethod('init', this.currentPageType, this.currentURL, this.currentPageNumber, this.maxNumberOfPages);
				
				if(this.currentPageNumber > -1 && this.maxNumberOfPages > -1){
					
					var $currentPageContent = this.callMethod('getCurrentPageContent', this.currentPageType, this.currentURL);
					
					$currentPageContent.addClass('AntiPagination_page').addClass('AntiPagination_currentPage').addClass('AntiPagination_p' + this.currentPageNumber).attr('data-antipagination-page', this.currentPageNumber);
					var currentPageContentTag = $currentPageContent.prop("tagName");
					
					
					var mutationChangeEvent = function(mutations) {
						mutations.forEach(function(mutation) {
							AntiPagination.contentAdded(parseInt($(mutation.target).attr('data-antipagination-page')));
						});
						this.disconnect();
					};
					
					
					for(var i = 1; i < this.currentPageNumber; i++){
						var $newDiv = $("<" + currentPageContentTag + ">", {class: "AntiPagination_page AntiPagination_p" + i, "data-antipagination-page": i});
						$currentPageContent.before($newDiv);
						this.pageObservers[i] = new MutationObserver(mutationChangeEvent);
						this.pageObservers[i].observe($newDiv[0], {childList: true});
					}
					
					for(var i = this.maxNumberOfPages; i > this.currentPageNumber; i--){
						var $newDiv = $("<" + currentPageContentTag + ">", {class: "AntiPagination_page AntiPagination_p" + i, "data-antipagination-page": i});
						$currentPageContent.after($newDiv);
						this.pageObservers[i] = new MutationObserver(mutationChangeEvent);
						this.pageObservers[i].observe($newDiv[0], {childList: true});
					}
					
					this.RemovePagination();
				}
			}
			
			// Delay adding settings
			//setTimeout(function(){
				//AntiPagination.settings.addModal();
			//}, 100);
		},
		
		add: function(obj){
			this.pageTypes[obj.name] = new PageTypeClass(obj);
		},
		
		/**
		 * Call a method of the given pageType, or the current pageType
		 * @constructor
		 * @param {string} fName - Name of the function to be called.
		 * @param ({string|undefined}) author - Name of the page type.
		 * @param (*) [arguments] - Arguments for the function call.
		 * @returns {*}
		 */
		callMethod: function(fName, typeName){
			try{
				if(typeof typeName === "undefined" || typeof this.pageTypes[typeName] === "undefined") {
					if(typeof this.currentPageType === "undefined")
						throw "Invalid page type given";
					typeName = this.currentPageType;
				}
				
				if(typeof this.pageTypes[typeName][fName] !== "function"){
					throw 'Function "' + typeName + '.' + fName + '" does not exist!';
				}
				
				var args = Array.prototype.slice.call(arguments, 2);
				
				return this.pageTypes[typeName][fName].apply(this.pageTypes[typeName], args);
			}catch(e){
				console.log('Error callMethod: ', e);
				
			}
			
			return undefined;

		},
		
		getPageType: function(currentURL){
			if(typeof currentURL === "undefined") currentURL = this.currentURL;
			
			for(var name in this.pageTypes){
				if(this.callMethod('test', name, currentURL))
					return name;
			}
			return undefined;
		},
		
		RemovePagination: function(){
			if(typeof this.currentPageType !== "undefined" && this.currentPageNumber > -1 && this.maxNumberOfPages > -1){
					for(var i = 1; i <= this.maxNumberOfPages; i++){
						if(i != this.currentPageNumber){
							this.callMethod('addPageContent', this.currentPageType, this.currentURL, this.currentPageNumber, i, $('.AntiPagination_page[data-antipagination-page="'+i+'"]') );
						}
					}
			}
		},
		
		contentAdded: function(contentPageNumber, $content){
			this.numPagesAdded++;
			if(typeof $content === "undefined")
				$content = $(".AntiPagination_p" + contentPageNumber);
			this.callMethod('onContentAdded', this.currentPageType, contentPageNumber, $content);
			if(this.numPagesAdded >= (this.maxNumberOfPages -1))
				this.allPagesAdded();
		},
		
		allPagesAdded: function(){
			this.callMethod('onAllPagesAdded', this.currentPageType);
		},
		
		settings: {
			
			show: function(){
				$('#AntiPaginationSettings').modal('show');
				
			},
		
			addModal: function(){
				var modal = '\
					<div class="tw-bs" style="color:#000000;">\
						<div id="AntiPaginationSettings" class="tw-bs modal fade">\
							<div class="tw-bs modal-dialog" style="z-index: 1500;left:0;padding-bottom:10px;padding-top:10px;right:0;">\
								<div class="tw-bs modal-content">\
									<div class="tw-bs modal-header" style="color:#000000;">\
										<button type="button" class="tw-bs close" data-dismiss="modal" aria-hidden="true">×</button>\
										<h4 class="tw-bs modal-title">Anti-Pagination</h4>\
									</div>\
									<div class="tw-bs modal-body" style="color:#000000;">\
										<p>Settings Body</p>\
									</div>\
									<div class="tw-bs modal-footer" style="color:#000000;">\
										<button type="button" class="tw-bs btn btn-default" data-dismiss="modal">Close</button>\
										<button type="button" class="tw-bs btn btn-primary">Save changes</button>\
									</div>\
								</div><!-- /.modal-content -->\
							</div><!-- /.modal-dialog -->\
						</div><!-- /.modal -->\
					</div>';

				//$('body').append(modal);
			}
		
		}
		
		
	};
	
// Page Types

{{{ADD_PAGE_TYPES}}}
	
	unsafeWindow.AntiPagination = AntiPagination;
	
	// Start the script
	//setTimeout(function(){
	function onReadyCB(){
		//console.log('onReadyCB');
		AntiPagination.init();
		
		// Get the page load time
		scriptLoadTime = performance.now();
		
		// Wait to report data (required if you want "pageLoadTime" to be accurate)
		MUJS.onPageReady = getMUJSUpdate;
	}
	MUJS.onReady = onReadyCB;
	
});

} catch(e) {
	//console.log('caught error', e);
	console.log('caught error', e.stack);
	MUJS.ERROR.processError(e);
}

//}