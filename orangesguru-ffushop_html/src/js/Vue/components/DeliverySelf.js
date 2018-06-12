/*
 *  ------------------ New Post delivery component ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    deliverySelfLang = {            
        ua : {
            title : 'Самовивіз',
        },
        en : {
            title : 'Self-delivery',
        }
    }

// register provider    
ffuShop.store.commit('createDeliveryProvider', ['self', {       
    component : 'self-delivery',
    title : deliverySelfLang[lang].title,                   
    cost : 0,
    options : {
        details : [deliverySelfLang[lang].title]
    },
    valid : true
}]);

// component description
Vue.component('self-delivery', {
    props : {
        isActive : {
            type : Boolean,
            required : true
        }
    },
    data : function() {
        return {
            providerName : 'self'
        }
    },
    computed : {
        isValid : function() {
            return true;
        },
    },
    created : this.validate,
    updated : this.validate,
    methods : {
        validate : function() {
            this.$store.commit('setDeliveryProviderValid', [
                this.providerName,
                this.isValid
            ]);
        }
    },
    template : '<div></div>'
});