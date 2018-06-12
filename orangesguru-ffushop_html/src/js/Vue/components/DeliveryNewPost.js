/*
 *  ------------------ New Post delivery component ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    deliveryNewPostLang = {            
        ua : {
            title : 'Нова Пошта',
            buttonText : 'Оберіть номер відділення',
            detailsPrefix : 'Україна, м. ',
            noCityErr : 'Оберiть мicто зi списку мiст'
        },
        en : {
            title : 'Nova Poshta',
            buttonText : 'Choose Department',
            detailsPrefix : 'Ukraine, м. ',
            noCityErr : 'Choose city from list'
        }
    }

// register provider    
ffuShop.store.commit('createDeliveryProvider', ['new-post', {       
    component : 'new-post-delivery',
    title : deliveryNewPostLang[lang].title,                   
    cost : 75,
    options : {
        city : null,
        department : null,
        warehouse: null,
        details : [deliveryNewPostLang[lang].title]
    },
    valid : false,
}]);

jQuery(document).ready(function($){
    
    // install scripts and styles
    var gmapsScript = $('<script async="" defer="" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAPhm7Q29X5ldwjLtA7IMYHU_0xATiWK3A&amp;language=ua">');    
    var newPostStyles = $('<link rel="stylesheet" href="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/Map/styles/map.css">');
    $('head').append(newPostStyles);
    $('body').append(gmapsScript);
    
})


// component description
Vue.component('new-post-delivery', {
    props : {
        isActive : {
            type : Boolean,
            required : true
        }
    },
    data : function() {
        return {
            providerName : 'new-post',
            fields : {
                city : {
                    required : true
                },
                department : {
                    required : true
                },
                warehouse: {
                    required : true
                },

            },
            buttonText : deliveryNewPostLang[lang].buttonText
        }
    },
    computed : {
        deliveryData : function() {
            return this.$store.state.deliveryProviders[ this.providerName ].options
        },
        department : function() {
            if ( this.deliveryData.city && this.deliveryData.department ) {
                return this.deliveryData.city + ', ' + this.deliveryData.department;
            } else { return ''; }
        },
        isValid : function() {
            var valid = true;            
            for ( field in this.fields ) {
                if ( this.fields[field].required && ! this.deliveryData[field] ) {
                    valid = false;
                }
            };
            return valid;
        }
    },
    mounted : function() {
        
        var newPostScript = $('<script type="text/javascript" id="map" charset="utf-8" data-lang="ua" apiKey="597859b7955dc05b6595d86bd6fc96fc" data-town="undefined" data-town-name="undefined" data-town-id="undefined" src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/Map/dist/map.min.js">');
        $('body').append(newPostScript);
        
        function getDetails() {
            console.log('get details');
            function setDetails(e) {
                
                if ( e.target.id == 'npw-map-close-button' ) {
                    
                    $('#npw-map-wrapper').off('click', setDetails);
                    return;
                }
                
                var department = $('#npw-map-state-details .npw-details-title');
                var city = $('#npw-cities').val();


                if ( department.text() != '' && city !== null  ) {

                    $.ajax({
                        type:ffuShop.routes.cart.getNPDeliveryPrice.req,
                        url: ffuShop.routes.cart.getNPDeliveryPrice.url,
                        dataType: 'json',
                        data:{  city: city ,
                            department: department.text(),
                            productsQuantity : ffuShop.checkout.cartTotal.quantity,
                            productsCost: ffuShop.checkout.cartTotal.products
                        },
                        success: function(res){
                            //console.log(res);
                            ffuShop.store.commit('setDeliveryProviderCost', [
                                'new-post',
                                res.price
                            ]);
                            ffuShop.store.commit('setDeliveryProviderField', [
                                'new-post',
                                'warehouse',
                                res.warehouse
                            ]);
                            ffuShop.store.commit('setDeliveryProviderField', [
                                'new-post',
                                'details',
                                [deliveryNewPostLang[lang].detailsPrefix + city, department.next().text()]
                            ]);
                        }
                    });

                    ffuShop.store.commit('setDeliveryProviderField', [
                        'new-post',
                        'city',
                        city
                    ]);
                    ffuShop.store.commit('setDeliveryProviderField', [
                        'new-post',
                        'department',
                        department.text()
                    ]);

                    ffuShop.store.commit('setDeliveryProviderValid', [
                        'new-post',
                        true
                    ]);

                    $('#npw-map-wrapper').off('click', setDetails);
                    $('#npw-map-close-button').click();

                } else {
                    
                    ffuShop.store.commit('setDeliveryProviderField', [
                        'new-post',
                        'city',
                        ''
                    ]);
                    ffuShop.store.commit('setDeliveryProviderField', [
                        'new-post',
                        'department',
                        ''
                    ]);
                    ffuShop.store.commit('setDeliveryProviderField', [
                        'new-post',
                        'details',
                        []
                    ]);
                    ffuShop.store.commit('setDeliveryProviderValid', [
                        'new-post',
                        false
                    ]);
                    
                    if ( city == null ) {
                        UIkit.notification({
                            message : deliveryNewPostLang[lang].noCityErr,
                            status : 'danger'
                        })
                    }
                }
            }
                
            $('#npw-map-wrapper').on('click', setDetails);
        }

        $('#fsCheckout').on('click', '#npw-map-open-button', getDetails);

        $('#fsCheckout').on('click', '#npw-map-close-button', function(){
            $('#npw-map-wrapper').off('click', setDetails);
            $('#fsCheckout').off('click', '#npw-map-open-button', getDetails);
        });
    },
    beforeDestroy : function() {
        NPWidgetMap = null;
        $('#map, #npw-map-wrapper').remove();
    },
    created : this.validate,
    updated : this.validate,
    methods : {
        errorClass : function() {
            if ( ! this.isActive ) return 'uk-button-default';
            return (this.isValid ? 'uk-button-default' : 'uk-button-danger');
        },
        validate : function() {
            this.$store.commit('setDeliveryProviderValid', [
                this.providerName,
                this.isValid()
            ]);
        }
    },
    template : '<div id="np-map">\
                    <button type="button" id="npw-map-open-button" class="uk-button" :class="errorClass()">{{ buttonText }}</button>\
                    <br class="uk-hidden@s">\
                    {{ department }}\
                </div>'
});