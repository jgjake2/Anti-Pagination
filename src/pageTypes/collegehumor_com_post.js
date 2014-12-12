// +@typename         collegehumor_com_post
// +@include          http://www.collegehumor.com/post/*
// +@history          (0.0.1) Initial Release
// +@history          (0.0.12) Updated addPageContent to use $target

AntiPagination.add({
	name: 'collegehumor_com_post',
	test: function(currentURL){
		// Test URL
		var isCollegeHumorPostPatt = /https?\:\/\/(?:www\.)?collegehumor\.com\/post\//i;
		var isCollegeHumorPost = false;
		isCollegeHumorPost = isCollegeHumorPostPatt.test(currentURL);
		if(isCollegeHumorPost) isCollegeHumorPost = ($('.pagination').length > 0);
		return isCollegeHumorPost;
	},
	init: function(currentURL, currentPageNumber, maxNumberOfPages){
		
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
	getMaxNumberOfPages: function(currentURL){
		var pagePatt = /page\s+(\d+)\s+of\s+(\d+)/i;
		
		var $Pagination = $('.pagination');
		
		var $PaginationTotal = $Pagination.find('.total:first');
		
		var match = pagePatt.exec($PaginationTotal.html());
		
		var currentNum = match[2];
		
		if(typeof currentNum !== "undefined" && currentNum != '') return parseInt(currentNum);
		return -1;
	},
	getCurrentPageContent: function(currentURL){
		if($('.AntiPagination_currentPage').length > 0)
			return $('.AntiPagination_currentPage');
		$('.post-content').addClass('AntiPagination_currentPage');
		return $('.post-content');
	},
	addPageContent: function(currentURL, currentPageNumber, contentPageNumber, $target){
		console.log('addPageContent', contentPageNumber);
		var urlHTMLPatt = /(?:\/page\:\d+|\/){1}?$/gi;
		if(!urlHTMLPatt.test(currentURL))
			currentURL = currentURL + '/';
		var newURL = currentURL.replace(urlHTMLPatt, "/page:" + contentPageNumber);
		newURL += ' .post-content > *';
		$target.load(newURL, function(){});
	},
	onAllPagesAdded: function(){
		console.log('onAllPagesAdded!');
	},
	onContentAdded: function(contentPageNumber, $content){
		$(".AntiPagination_p" + contentPageNumber + ' .pagination').remove();
	}
});