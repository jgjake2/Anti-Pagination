// +@typename         cracked_com_blog
// +@include          http://www.cracked.com/blog/*
// +@history          (0.0.1) Initial Release
// +@history          (0.0.9) Removed bottom banner on pages
// +@history          (0.0.12) Updated addPageContent to use $target

AntiPagination.add({
	name: 'cracked_com_blog',
	test: function(currentURL){
		// Test URL
		var isCrackedBlogPatt = /https?\:\/\/(?:www\.)?cracked\.com\/blog\//i;
		var isCrackedBlog = false;
		isCrackedBlog = isCrackedBlogPatt.test(currentURL);
		if(isCrackedBlog) isCrackedBlog = ($('.PaginationContent').length > 0);
		return isCrackedBlog;
	},
	init: function(currentURL, currentPageNumber, maxNumberOfPages){
		$content = this.getCurrentPageContent(currentURL, currentPageNumber);
		this.removeBottomBanner($content);
	},
	getCurrentPageNumber: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		
		var currentNum = $PaginationContent.find('.paginationNumber').first().html();
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getMaxNumberOfPages: function(currentURL){
		var $PaginationContent = $('.PaginationContent');
		var maxNum = $PaginationContent.find('.paginationNumber').last().html();
		if(typeof maxNum !== "undefined" && maxNum != '') return parseInt(maxNum);
		return -1;
	},
	getCurrentPageContent: function(currentURL){
		if($('.AntiPagination_currentPage').length > 0)
			return $('.AntiPagination_currentPage');
		$('#safePlace .body > section:first').addClass('AntiPagination_currentPage');
		return $('#safePlace .body > section:first');
	},
	addPageContent: function(currentURL, currentPageNumber, contentPageNumber, $target){
		var urlHTMLPatt = /((?:_p\d+)?\/)\s*$/gi;
		
		var newURL = currentURL.replace(urlHTMLPatt, "_p" + contentPageNumber + "/");
		
		newURL += ' #safePlace .body > section:first > *';
		
		//$(".AntiPagination_p" + contentPageNumber).load(newURL, function(){});
		$target.load(newURL, function(){});
		
	},
	onContentAdded: function(contentPageNumber, $content){
		this.removeBottomBanner($content);
		$content.find('img[data-img]').each(function(){
			$this = $(this);
			var dataImg = $this.attr('data-img');
			$this.attr('src', dataImg).css('display', 'inline');
		});
	},
	onAllPagesAdded: function(){
		console.log('onAllPagesAdded!');
	},
	removeBottomBanner: function($content){
		$lastP = $content.children('p').last();
		if($lastP.find('a[target="_blank"] img').length > 0)
			$lastP.remove();
	}
});
