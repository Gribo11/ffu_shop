/*
 *  ------------------ User form in checkout ----------------
 */

// translations
var lang = ffuShop.translation.lang;

ffuShop.translation.userInfoCheckout = {            
    ua : {
        first_namePlaceholder : 'Ваше iм`я',
        last_namePlaceholder : 'Ваше прізвище',
        emailPlaceholder : 'Ваш e-mail',
        phonePlaceholder : 'Ваш телефон'
    },
    en : {
        first_namePlaceholder : 'Your First Name',
        last_namePlaceholder : 'Your Last Name',
        emailPlaceholder : 'Your E-mail',
        phonePlaceholder : 'Your Phone'
    }
}

// component description
Vue.component('user-info-checkout', {
    store : ffuShop.store,
    data : function() {
        return {
            fields : {
                first_name : {
                    type : 'text',
                    placeholder : ffuShop.translation.userInfoCheckout[lang].first_namePlaceholder,
                    required : true,
                    valid : false,
                    pattern : new RegExp('^[a-zа-я ,.\'-]+$', 'i')
                },
                last_name : {
                    type : 'text',
                    placeholder : ffuShop.translation.userInfoCheckout[lang].last_namePlaceholder,
                    required : false,
                    valid : true,
                },
                email : {
                    type : 'email',
                    placeholder : ffuShop.translation.userInfoCheckout[lang].emailPlaceholder,
                    required : true,
                    valid : false,
                    pattern : new RegExp(/^([\w.*-]+@([\w-]+\.)+[\w-]{2,4})$/)
                    
                },
                phone : {
                    type : 'tel',
                    placeholder : ffuShop.translation.userInfoCheckout[lang].phonePlaceholder,
                    required : true,
                    valid : false,
                    pattern : new RegExp('\\+38\\([0-9]{3}\\)[0-9]{3}-[0-9]{2}-[0-9]{2}')
                }
            }
        }
    },
    computed : {        
        fieldValues : function() {
            return {
                first_name : this.$store.state.user.first_name,
                last_name : this.$store.state.user.last_name,
                email : this.$store.state.user.email,
                phone : this.$store.state.user.phone
            }
        },
        user : function() {
            return this.$store.state.user;
        },
    },
    created : this.validate,
    updated : this.validate,
    methods : {
        setField : function(e) {
            var fieldName = e.target.name,
                fieldValue = e.target.value;
            
            // filter phone            
            if ( fieldName == 'phone' ) {
                
                var phone = '+38(0',
                    oldval = fieldValue;
                
                fieldValue = fieldValue.replace(/\D/g, ''); // remove not digits
                fieldValue = fieldValue.replace(/^(380|38|3)/, ''); // remove 38 in beginning
                fieldValue = fieldValue.substring(0,9); // crop number
                for (var i=0; i<fieldValue.length; i++) {
                    phone += fieldValue[i] + ( i == 1 ? ')' : '');
                    phone += ( i == 4 || i == 6 ? '-' : '');
                }
                // chech deleting symbol
                if ( oldval.length < phone.length
                     && phone[phone.length-1].match(/\D/) ) {
                    phone = phone.substring(0, phone.length - 1);
                }
                fieldValue = phone;
                e.target.value = phone;
            }                    
            
            this.$store.commit('setUserInfo', [ fieldName, fieldValue ]);
            this.validate();
        },
        
        filedValid : function(fieldName) {
            
            var field = this.fields[fieldName],
                value = this.fieldValues[fieldName],
                valid = true;
                            
            // check required
            if ( field.required && ! value ) {
                valid = false;  
            }
            // check pattern
            if ( field.pattern && ! field.pattern.test(value) ) {
                valid = false;
            }
            
            return valid;
        },
        
        validate : function() {
            
            var valid = true;
            
            for ( field in this.fields ) {
                
                valid = valid && this.filedValid(field);
            }
            
            this.$store.commit('setUserInfo', ['valid', valid ]);
        }
    },
    template : '<form action="" class="uk-grid-small uk-child-width-1-2@s uk-child-width-1-4@l" uk-grid>\
        <div v-for="(field, name) in fields" :key="name">\
            <input  :type="field.type"\
                    :name="name"\
                    class="uk-input"\
                    :class="{\'uk-form-danger\': ! filedValid(name)}"\
                    :disabled="user.registered"\
                    :placeholder="field.placeholder + (field.required ? \' *\' : \'\')"\
                    :value="fieldValues[name]"\
                    @input="setField">\
        </div>\
    </form>'
});