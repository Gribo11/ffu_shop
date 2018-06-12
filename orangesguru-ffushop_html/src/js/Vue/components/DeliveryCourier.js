/*
 *  ------------------ Courier delivery component ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    deliveryCourierLang = {            
        ua : {
            title : 'Кур\'єрська доставка по м. Києву',
            placeholderStr : 'вул./пров./пл.',
            placeholderBld : 'дім',
            placeholderApt : 'кв',
        },
        en : {
            title : 'Courier Delivery in Kiev',
            placeholderStr : 'str./sq.',
            placeholderBld : 'bld.',
            placeholderApt : 'apt.',
        }
    }

// register provider    
ffuShop.store.commit('createDeliveryProvider', ['courier', {       
    component : 'courier-delivery',
    title : deliveryCourierLang[lang].title,                   
    cost : 100,
    options : {
        addressStr : null,
        addressBld : null,
        addressApt : null,
        details : [deliveryCourierLang[lang].title]
    },
    valid : false
}]);

// component description
Vue.component('courier-delivery', {
    props : {
        isActive : {
            type : Boolean,
            required : true
        }
    },
    store : ffuShop.store,        
    data : function() {
        return {
            providerName : 'courier',                                
            fields : {
                addressStr : {
                    wrapClass : 'uk-width-expand@s',
                    placeholder : deliveryCourierLang[lang].placeholderStr,
                    required : true,
                    valid : false
                },
                addressBld : {
                    wrapClass : 'uk-width-1-2 uk-width-small@s',
                    placeholder : deliveryCourierLang[lang].placeholderBld,
                    required : true,
                    valid : false
                },
                addressApt : {
                    wrapClass : 'uk-width-1-2 uk-width-small@s',
                    placeholder : deliveryCourierLang[lang].placeholderApt,
                    required : true,
                    valid : false
                }
            }
        }
    },
    computed : {
        isValid : function() {
            var valid = true;
            for ( field in this.fields ) {
                if ( this.fields[field].required && ! this.fieldValues[field] ) {
                    valid = false;
                    Vue.set( this.fields[field], 'valid', false );
                } else {
                    Vue.set( this.fields[field], 'valid', true );
                }
            };
            return valid;
        },
        fieldValues : function() {
            return this.$store.state.deliveryProviders[ this.providerName ].options;
        }        
    },
    created : this.validate,
    updated : this.validate,
    methods : {
        errorClass : function(field) {
            if ( ! this.isActive ) return '';
            return (field.valid ? '' : 'uk-form-danger');
        },
        deliveryDetails : function() {
            var details = '';
            for (i in this.fields ) {
                details += ( details.length ? ', ' : '');
                details += this.fields[i].placeholder + ' ' + this.fieldValues[i];
            }
            return details;
        },
        checkField : function(e) {                
            var fieldName = e.target.name,
                fieldValue = e.target.value;

            this.$store.commit('setDeliveryProviderField', [
                this.providerName,
                fieldName,
                fieldValue
            ]);
            
            var details = [deliveryCourierLang[lang].title];
                details.push( this.deliveryDetails() );
            this.$store.commit('setDeliveryProviderField', [
                this.providerName,
                'details',
                details
            ]); 
            
            this.validate();
        },
        validate : function() {
            this.$store.commit('setDeliveryProviderValid', [
                this.providerName,
                this.isValid
            ]);
        }
    },
    template : '<form action="" uk-grid>\
                    <div v-for="(field, fieldName) in fields"\
                         :key="fieldName"\
                         :class="field.wrapClass">\
                         <input type="text" class="uk-input"\
                                :class="errorClass(field)"\
                                :value="fieldValues[fieldName]"\
                                :name="fieldName"\
                                :placeholder="field.placeholder"\
                                @input="checkField">\
                    </div>\
                </form>'
});