var ffuShop = ffuShop || {};



/*
 * Helpers
 */

ffuShop.helpers = {
    
    // trigger native browser change event in jQuery objects
    nativeChange : function(e) {
        if ( 'originalEvent' in e ) return;
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            this.dispatchEvent(evt);
        }
        else { 
            this.fireEvent("onchange")
        };
    },
    
    // creates error html from error object
    createErrorMsg : function( errObj ) {
        var text = '<ol class="uk-text-left">';
        $.each(errObj, function(error, fields){
            text += '<li>';
            $.each(fields, function(i, line){
                text += line + '<br>'
            });
            text += '</li>';
        });
        text += '</ol>';        
        return text;
    },
    
    errorHandler : function( errObj ) {
        if ( errObj instanceof Error ) {
            throw errObj;
        } else {
            UIkit.notification({
                status : 'danger',
                message : ffuShop.helpers.createErrorMsg(errObj)
            })
        }
    },
    
    // rejects promise with no 200 status
    errorReject : function( reject, err, text ) {
        if ( err.responseJSON ) {
            if ( err.responseJSON.errors ) {   
                reject( err.responseJSON.errors );
            } else if ( err.responseJSON.exception ) {
                reject({
                    Exception : [text, err.responseJSON.exception]
                })
            }
        }
    }
}



/*
 * Global Translations
 */

@@include( './src/js/config/language.js' )



/*
 * API Routes
 */

@@if ( process.env.NODE_ENV == 'development' ) { @@include( './src/js/config/dev_routes.js' ) }
@@if ( process.env.NODE_ENV != 'production' ) { @@include( './src/js/config/routes.js' ) }


jQuery(document).ready(function($){
    
    /*
     * Navbar togglers
     */
    
    function searchClose(e) {
                
        if ( $(e.target).closest('#fsSearch').length ) return;
        
        e.preventDefault();
        $('#fsSearch').slideUp('fast');
        $('body').off('click', searchClose);        
    }
    
    function collapseClose(e) {
        
        if ( $(e.target).closest('#fsMenuCollapse').length ||
             $(e.target).closest('#fsMenuToggle').length ) return;
        
        e.preventDefault();
        $('#fsMenuCollapse').removeClass('uk-open uk-animation-fade uk-animation-fast').off('click', clickParentHandler);
        $('body').off('click', collapseClose);        
    }
    
    function clickParentHandler(e) {
        if ( ! $(e.target).closest('.uk-navbar-dropdown-nav').length ) {
            e.preventDefault();
        }
    }
    
    $('.fs-search-open').on( 'click', function(){
        
        var searchForm = $('#fsSearch');
        var menuCollapse = $('#fsMenuCollapse');
        
        searchForm.slideToggle('fast', function(){
            if ( searchForm.is(':visible') ) {
                $('body').on('click', searchClose)
            }
        });
        
        if ( menuCollapse.hasClass('uk-open') ) {            
            menuCollapse.removeClass('uk-open uk-animation-fade uk-animation-fast');
            $('body').off('click', collapseClose);
        }
    })
    
    $('#fsMenuToggle').on('click', function(){
        
        var menuCollapse = $('#fsMenuCollapse');
        
        $('#fsSearch').slideUp('fast');
        $('body').off('click', searchClose);
        menuCollapse.toggleClass('uk-open uk-animation-fade uk-animation-fast');
        
        if ( menuCollapse.is(':visible') ) {       
            $('body').on('click', collapseClose);
            menuCollapse.on('click', '.uk-parent', clickParentHandler);
        } else {
            $('body').off('click', collapseClose)
            menuCollapse.off('click', clickParentHandler)
        }        
    })
    
    /*
     * Responsive category subnav
     */
    
    $(window).on('load', function(){
        
        var categorySubnav = $('#fsCategoryView .uk-subnav');
        var length = 0;
        
        function switchSubnavView() {
            
            var bound = categorySubnav.closest('.uk-container');
            var boundWidth = bound.innerWidth() - parseInt(bound.css('padding-left') ) - parseInt(bound.css('padding-right'));            
            var display = ( boundWidth > length ? 'desktop' : 'mobile' );
            
            switch ( display ) {                    
                case 'desktop' :
                    categorySubnav.removeClass('uk-hidden');
                    categorySubnav.next().addClass('uk-hidden');
                    break;                    
                case 'mobile' :
                default :
                    categorySubnav.addClass('uk-hidden');
                    categorySubnav.next().removeClass('uk-hidden');
                    break;
            }            
        }
        
        if ( !categorySubnav ) return;
        
        categorySubnav.find(' > li').each(function(i, item){
            length += $(item).outerWidth();
        });
        length -= 20; // margin
        
        switchSubnavView();        
        $(window).on('resize', switchSubnavView);
    })
    
    
    // Set category active class    
    var catNav = $('#fsCategoryView > .uk-container > .uk-subnav > li > a, .fs-category-responsive .uk-nav > li > a, .fs-sidebar-nav .uk-list > li > a');

    if ( catNav.length ) {        
        var url = location.origin + location.pathname;
        var name;
        catNav.each(function(i, link){
            var $link = $(link);
            if ( $link.attr('href') == url ) {
                $link.parent().addClass('uk-active');
                name = $link.text();
            }
        });
        $('.fs-category-responsive .fs-cat-name').text( name );
    }
    
    
    
    /*
     * Handle small product card color click
     */
    
    if ( sessionStorage ) {
    
        var event = ( ("ontouchstart" in document.documentElement) ? 'click' : 'mouseenter' );

        $('body').on(event, '.fs-product-card[data-product-id] .fs-product-colors > li', function(e){
                        
            var colorBtn = $(e.target).closest('li');
            var variationSku = colorBtn.data('sku');

            if ( ! variationSku ) return;

            var card = colorBtn.closest('.fs-product-card');
            var imageHolder = card.find('.fs-product-card-image');

            if ( sessionStorage[variationSku] ) {

                if ( sessionStorage[variationSku] == 'no_image' ) return;
                
                imageHolder.css('background-image', 'url(' + sessionStorage[variationSku] + ')' );
                return;
            }

            $.ajax({
                type: ffuShop.routes.cart.getNPDeliveryPrice.req,
                url: ffuShop.routes.cart.getNPDeliveryPrice.url + card.data('product-id'),
                dataType: 'json',
                success: function(res){
                    console.log(res);
                    for ( sku in res ) {
                        var image = res[sku].sku_image ? res[sku].sku_image : 'no_image';
                        if ( image != 'no_image' ) imageHolder.css('background-image', 'url(' + image + ')' );
                        sessionStorage[sku] = image;
                    }
                }
            })
        })
    
    }
    
    
    
    /*
     * Define translation language
     */
    
    ffuShop.translation = ffuShop.translation || {};
    
    if ( ~$('html').attr('lang').indexOf('en') ) ffuShop.translation.lang = 'en';
    
    
    
    /*
     * Token 
     */
    
    $.ajaxSetup({
        dataType : 'json',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
    });
    
    
    
    /*
     * Data Store
     */
    
    @@include('./src/js/Vuex/store.js')
    
    
    
    /*
     * Quantity component
     */
    
    @@include('./src/js/Vue/components/QuantityCounter.js')
    
    
    
    /*
     * Instances
     */
    
    @@include('./src/js/Vue/Navbar.js')
    
    @@include('./src/js/Vue/ProductSingle.js')
    
    @@include('./src/js/Vue/UserAccount.js')

})