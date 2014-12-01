// ==UserScript==
// @name             Anti-Pagination
// @namespace        http://myuserjs.org/user/jgjake2
// @description      Avoid Pagination and simply load all the pages onto one page
// @author           jgjake2
// @downloadURL      http://myuserjs.org/script/jgjake2/Anti-Pagination.user.js
// @updateURL        http://myuserjs.org/script/jgjake2/Anti-Pagination.meta.js
{{{INCLUDES}}}
{{{EXCLUDES}}}
// @require          http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require          http://test2.myuserjs.org/API/MUJS.js/0.0.5
{{{REQUIRES}}}
// @version          0.0.6
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
// @grant            GM_getMetadata
// @grant            GM_xmlhttpRequest
// @noframes
// ==/UserScript==

MUJS.config('script.username', 'jgjake2');
MUJS.config('script.script_name', 'Anti-Pagination');
MUJS.config('Update.getType', 'data');
MUJS.config('Update.DOMTiming', true);

var scriptLoadTime = -1;

var updateCallback = function(result){
	console.log('updateCallback ', result);
}

var script_info = {};

if(typeof GM_info !== "undefined" && typeof GM_info.scriptHandler !== "undefined" && GM_info.scriptHandler == 'Tampermonkey'){
	script_info = GM_info.script;
	script_info.script_handler = 'Tampermonkey';
	script_info.script_handler_version = GM_info.version;
} else if(typeof GM_info !== "undefined"){
	script_info = GM_info.script;
	script_info.script_handler = 'Greasemonkey';
	script_info.script_handler_version = GM_info.version;
} else if(typeof GM_getMetadata !== "undefined"){
	script_info.script_handler = 'Scriptish';
	/*
	
	...Fuck Scriptish
	
	script_info = GM_getMetadata() || {};
	//script_info.version = GM_getMetadata('version');
	console.log('GM_getMetadata', script_info);
	*/
}

MUJS.config('Update.script_info', script_info);
console.log('script_info', script_info);

function getMUJSUpdate(){
	var opts = {
		callback: updateCallback,
		getType: 'data',
		args: {}
	};
	if(scriptLoadTime > -1)
		opts.args.scriptLoadTime = scriptLoadTime;
	
	MUJS.UPDATE.getUpdateData(opts);
}


$(document).ready(function() {  
	var pageTypes = {
		types: {},
		currentPageType: undefined,
		
		currentPageNumber: -1,
		maxNumberOfPages: -1,
		
		init: function(currentURL){
			if(typeof currentURL === "undefined")
				currentURL = window.location.href;
			this.currentPageType = this.getPageType();
			
			if(typeof this.currentPageType !== "undefined"){
				if(typeof this.types[this.currentPageType].init !== "undefined")
					this.types[this.currentPageType].init(currentURL);
					
				this.currentPageNumber = this.types[this.currentPageType].getCurrentPageNumber(currentURL);
				this.maxNumberOfPages = this.types[this.currentPageType].getgetMaxNumberOfPages(currentURL);
				
				if(this.currentPageNumber > -1 && this.maxNumberOfPages > -1){
					
					var $currentPageContent = this.types[this.currentPageType].getCurrentPageContent(this.currentPageNumber, currentURL);
					
					$currentPageContent.addClass('AntiPagination_page').addClass('AntiPagination_currentPage').addClass('AntiPagination_p' + this.currentPageNumber);
					var currentPageContentTag = $currentPageContent.prop("tagName");
					
					var changeEvent = function(event){
						$(this).unbind(event);
						try{
							var pageNumPatt = /AntiPagination_p(\d+)/i;
							var matches = pageNumPatt.exec($(this).attr('class'));
							
							pageTypes.contentAdded(parseInt(matches[1]));
						} catch(e){
							console.log('Error! changeEvent', e);
						}
					};
					
					for(var i = 1; i < this.currentPageNumber; i++){
						var $newDiv = $("<" + currentPageContentTag + ">", {class: "AntiPagination_page AntiPagination_p" + i});
						$newEl = $currentPageContent.before($newDiv);
						$newDiv.bind("DOMSubtreeModified", changeEvent);
					}
					
					for(var i = this.maxNumberOfPages; i > this.currentPageNumber; i--){
						var $newDiv = $("<" + currentPageContentTag + ">", {class: "AntiPagination_page AntiPagination_p" + i});
						$newEl = $currentPageContent.after($newDiv);
						$newDiv.bind("DOMSubtreeModified", changeEvent);
					}
					
					this.RemovePagination(currentURL);
				}
			}
		},
		
		add: function(name, obj){
			this.types[name] = obj;
		},
		
		getPageType: function(currentURL){
			if(typeof currentURL === "undefined")
				currentURL = window.location.href;
			
			for(var name in this.types){
				if(this.types[name].test(currentURL))
					return name;
			}
			
			return undefined;
		},
		
		RemovePagination: function(currentURL){
			if(typeof currentURL === "undefined")
				currentURL = window.location.href;
				
			if(typeof this.currentPageType !== "undefined" && this.currentPageNumber > -1 && this.maxNumberOfPages > -1){
					for(var i = 1; i <= this.maxNumberOfPages; i++){
						if(i != this.currentPageNumber){
							this.types[this.currentPageType].addPageContent(currentURL, this.currentPageNumber, i);
						}
					}
			}
		},
		
		contentAdded: function(contentPageNumber, $content){
			if(typeof $content === "undefined")
				$content = $(".AntiPagination_p" + contentPageNumber);
			
			if(typeof this.types[this.currentPageType].onContentAdded !== "undefined"){
				this.types[this.currentPageType].onContentAdded(contentPageNumber, $content);
			}
		}
		
		
	};

{{{ADD_PAGE_TYPES}}}
	
	pageTypes.init();
	
	scriptLoadTime = performance.now();
	
	setTimeout(getMUJSUpdate, 2500);
	
});
