// ==UserScript==
// @name             Anti-Pagination
// @namespace        http://myuserjs.org/user/jgjake2
// @description      Avoid Pagination and simply load all the pages onto one page
// @author           jgjake2
// @downloadURL      http://myuserjs.org/script/jgjake2/Anti-Pagination.user.js
// @updateURL        http://myuserjs.org/script/jgjake2/Anti-Pagination.meta.js
// @include          http://www.cracked.com/article_*
// @include          http://www.cracked.com/blog/*
// @include          http://www.collegehumor.com/post/*
// @require          http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require          http://myuserjs.org/API/MUJS.js/0.0.2
// @version          0.0.3
// @history          (0.0.3) Clean Up code
// @history          (0.0.2) MUJS API Fixes
// @history          (0.0.1) Initial Release
// @grant            unsafeWindow
// @noframes
// ==/UserScript==
//if (window.top != window.self) return;
//console.log('MUJS', MUJS);

MUJS.config('script.username', 'jgjake2');
MUJS.config('script.script_name', 'Anti-Pagination');
MUJS.config('Update.getType', 'data');
MUJS.config('Update.DOMTiming', true);

var scriptLoadTime = -1;

var updateCallback = function(result){
	console.log('updateCallback ', result);
}

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
							this.types[this.currentPageType].getPageContent(currentURL, this.currentPageNumber, i);
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

	
pageTypes.add('collegehumor_com_post', {
	test: function(currentURL){
		// Test URL
		var isCollegeHumorPostPatt = /https?\:\/\/(?:www\.)?collegehumor\.com\/post\//i;
		var isCollegeHumorPost = false;
		isCollegeHumorPost = isCollegeHumorPostPatt.test(currentURL);
		if(isCollegeHumorPost) isCollegeHumorPost = ($('.pagination').length > 0);
		return isCollegeHumorPost;
	},
	init: function(currentURL){
		
	},
	getCurrentPageNumber: function(currentURL){
		var pagePatt = /page\s+(\d+)\s+of\s+(\d+)/i;
		
		var $Pagination = $('.pagination');
		
		var $PaginationTotal = $Pagination.find('.total:first');
		
		var match = pagePatt.exec($PaginationTotal.html());
		
		var currentNum = match[1];
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getgetMaxNumberOfPages: function(currentURL){
		var pagePatt = /page\s+(\d+)\s+of\s+(\d+)/i;
		
		var $Pagination = $('.pagination');
		
		var $PaginationTotal = $Pagination.find('.total:first');
		
		var match = pagePatt.exec($PaginationTotal.html());
		
		var currentNum = match[2];
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getCurrentPageContent: function(currentPageNumber, currentURL){
		if($('.AntiPagination_currentPage').length > 0)
			return $('.AntiPagination_currentPage');
		$('.post-content').addClass('AntiPagination_currentPage');
		return $('.post-content');
	},
	getPageContent: function(currentURL, currentPageNumber, contentPageNumber){
		//console.log('getPageContent', currentPageNumber, contentPageNumber);
		var urlHTMLPatt = /(?:\/page\:\d+|\/){1}?$/gi;
		
		if(!urlHTMLPatt.test(currentURL))
			currentURL = currentURL + '/';
		
		var newURL = currentURL.replace(urlHTMLPatt, "/page:" + contentPageNumber);
		
		newURL += ' .post-content > *';
		
		$(".AntiPagination_p" + contentPageNumber).load(newURL, function(){});
		
	},
	
	onContentAdded: function(contentPageNumber, $content){
		$(".AntiPagination_p" + contentPageNumber + ' .pagination').remove();
	}
});
pageTypes.add('cracked_com_article', {
	test: function(currentURL){
		// Test URL
		var isCrackedArticlePatt = /https?\:\/\/(?:www\.)?cracked\.com\/article_/i;
		var isCrackedArticle = false;
		isCrackedArticle = isCrackedArticlePatt.test(currentURL);
		if(isCrackedArticle) isCrackedArticle = ($('.PaginationContent').length > 0);
		return isCrackedArticle;
	},
	init: function(currentURL){
	
	},
	getCurrentPageNumber: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		
		var currentNum = $PaginationContent.find('.paginationNumber').first().html();
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getgetMaxNumberOfPages: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		var maxNum = $PaginationContent.find('.paginationNumber').last().html();
		if(typeof maxNum !== "undefined" && maxNum != '') return parseInt(maxNum);
		return -1;
	},
	getCurrentPageContent: function(currentPageNumber, currentURL){
		if($('.AntiPagination_currentPage').length > 0)
			return $('.AntiPagination_currentPage');
		$('#safePlace .body > section:first').addClass('AntiPagination_currentPage');
		return $('#safePlace .body > section:first');
	},
	getPageContent: function(currentURL, currentPageNumber, contentPageNumber){
		console.log('getPageContent', currentPageNumber, contentPageNumber);
		var urlHTMLPatt = /((?:_p\d+)?\.html)\s*$/gi;
		
		var newURL = currentURL.replace(urlHTMLPatt, "_p" + contentPageNumber + ".html");
		
		newURL += ' #safePlace .body > section:first > *';
		
		$(".AntiPagination_p" + contentPageNumber).load(newURL, function(){});
		
	},
	
	onContentAdded: function(contentPageNumber, $content){
		$(".AntiPagination_p" + contentPageNumber + ' img[data-img]').each(function(){
			$this = $(this);
			var dataImg = $this.attr('data-img');
			$this.attr('src', dataImg).css('display', 'inline');
		});
	}
});

pageTypes.add('cracked_com_blog', {
	test: function(currentURL){
		// Test URL
		var isCrackedBlogPatt = /https?\:\/\/(?:www\.)?cracked\.com\/blog\//i;
		var isCrackedBlog = false;
		isCrackedBlog = isCrackedBlogPatt.test(currentURL);
		if(isCrackedBlog) isCrackedBlog = ($('.PaginationContent').length > 0);
		return isCrackedBlog;
	},
	init: function(currentURL){
		
	},
	getCurrentPageNumber: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		
		var currentNum = $PaginationContent.find('.paginationNumber').first().html();
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getgetMaxNumberOfPages: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		var maxNum = $PaginationContent.find('.paginationNumber').last().html();
		if(typeof maxNum !== "undefined" && maxNum != '') return parseInt(maxNum);
		return -1;
	},
	getCurrentPageContent: function(currentPageNumber, currentURL){
		if($('.AntiPagination_currentPage').length > 0)
			return $('.AntiPagination_currentPage');
		$('#safePlace .body > section:first').addClass('AntiPagination_currentPage');
		return $('#safePlace .body > section:first');
	},
	getPageContent: function(currentURL, currentPageNumber, contentPageNumber){
		console.log('getPageContent', currentPageNumber, contentPageNumber);
		var urlHTMLPatt = /((?:_p\d+)?\/)\s*$/gi;
		
		var newURL = currentURL.replace(urlHTMLPatt, "_p" + contentPageNumber + "/");
		
		newURL += ' #safePlace .body > section:first > *';
		
		$(".AntiPagination_p" + contentPageNumber).load(newURL, function(){});
		
	},
	
	onContentAdded: function(contentPageNumber, $content){
		$(".AntiPagination_p" + contentPageNumber + ' img[data-img]').each(function(){
			$this = $(this);
			var dataImg = $this.attr('data-img');
			$this.attr('src', dataImg).css('display', 'inline');
		});
	}
});

	
	pageTypes.init();
	
	scriptLoadTime = performance.now();
	
	setTimeout(getMUJSUpdate, 2500);
	
});
