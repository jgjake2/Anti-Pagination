
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
