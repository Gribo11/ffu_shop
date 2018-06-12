/*
 *  ------------------ User account instance ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    userAccountLang = {            
        ua : {
            male : 'Чоловіча',
            female : 'Жіноча',
            noEmail : 'Поле email обов`язкове',
            badEmail : 'Невiний Email',
            noPhone : 'Поле телефон обов`язкове',
            badPhone : 'Невiний телефон',
            noNames : 'Прізвище та ім`я обов`язкові',
            passMissMatch : 'Повтор пароля не співпадає з новим паролем',
            emptyFields : 'Всі поля обов`язкові',
            userSaved : 'Данi збережено'
        },
        en : {
            male : 'Male',
            female : 'Female',
            noEmail : 'Email address is required',
            badEmail : 'Email is wrong',
            noPhone : 'Phone is required',
            badPhone : 'Phone format is wrong',
            noNames : 'Your full name is required',
            passMissMatch : 'Repeated password do not match new password',
            emptyFields : 'All passwords are required',
            userSaved : 'Information saved'
        }
    }


if ( $('#fsUserAccount').length ) {

    // datepicker config
    if ( lang == 'ua' ) {
        jQuery.datepicker.setDefaults({
            dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            monthNamesShort: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
        });
    }
    
    ffuShop.userAccount = new Vue({
        el: '#fsUserAccount',
        store: ffuShop.store,
        data: function() {
            
            return {
                page: 0,
                editing: false,
                editedFields: {},
                orders: null,
                password: {
                    old : {
                        val : '',
                        type : 'password',
                    },
                    new : {
                        val : '',
                        type : 'password',
                    },
                    repeat : {
                        val : '',
                        class : '',
                    }
                }
            }
        },
        computed: {            
            user : function() {                
                return this.$store.getters.user;
            },
            sexTranslated : function() {
                if ( this.user.sex == 'male' ) {
                    return userAccountLang[lang].male;
                } else if ( this.user.sex == 'female' ) {
                    return userAccountLang[lang].female
                } else {
                    return '';
                }
            },            
            discountPrice : function( product ) {                
                if ( ! this.orders ) return;
                
                var discountPrice = [];
                this.orders.forEach(function( order, i ){
                    discountPrice[i] = [];
                    order.products.forEach(function( product, j ){
                        if ( ! product.discount ) {
                            discountPrice[i][j] = product.price;
                        } else {
                            var price = parseInt( product.price ),
                                disc = parseInt( product.discount );
                            discountPrice[i][j] = Math.round(price * (1+disc/100));
                        }
                    })
                });
                return discountPrice;
            },            
            orderTotal : function( products ) {                
                if ( ! this.orders ) return;
                
                var totals = [],
                    self = this;
                this.orders.forEach(function( order, i ){
                    var total = 0;
                    order.products.forEach(function( product, j ){
                        total += parseInt(product.qty) * self.discountPrice[i][j]
                    });
                    totals[i] = total + parseInt(order.delivery.cost);
                })
                return totals;
            }
        },
        methods: {            
            transBeforeEnter : function(el) {
                el.style.display = 'none';
            },
            transEnter : function(el, done) {
                var that = this;
                $(el).delay(300).slideDown(function(){                    
                    UIkit.update(event = 'update');                  
                    done();
                });
            },
            transLeave : function(el, done) {
                $(el).slideUp(done);
            },
            setPage : function(num) {
                if ( ! this.editing ) this.page = num;
            },
            
            // User editing methods
            
            setNewValue : function(e) {
                //console.log( e.target.name, e.target.value );
                var name = e.target.name,
                    value = e.target.value;
                
                Vue.set( this.editedFields, name, value );
            },
            saveUserData : function() {
                
                if ( $.isEmptyObject(this.editedFields) ) this.editing = false; 
                
                var valid = true;
                
                // check names
                if ( ('first_name' in this.editedFields) ||
                     ('last_name' in this.editedFields) ) {
                    
                    if ( ! (this.editedFields.first_name &&
                           this.editedFields.first_name) ) {
                        
                        valid = false;                        
                        UIkit.notification({
                            message: userAccountLang[lang].noNames,
                            status: 'danger'
                        })
                    }
                }
                
                // check email
                if ( ('email' in this.editedFields) &&
                     ! (/^([\w.*-]+@([\w-]+\.)+[\w-]{2,4})$/).test(this.editedFields.email) ) {
                    
                    valid = false;
                    var msgText = userAccountLang[lang][ this.editedFields.email.length ? 'badEmail' : 'noEmail' ];
                    UIkit.notification({
                        message: msgText,
                        status: 'danger'
                    })
                }
                
                // check phone
                if ( ('phone' in this.editedFields) &&
                     ! (/\+38\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}/).test(this.editedFields.phone) ) {
                    valid = false;
                    var msgText = userAccountLang[lang][ this.editedFields.phone.length ? 'badPhone' : 'noPhone' ];
                    UIkit.notification({
                        message: msgText,
                        status: 'danger'
                    })
                }
                
                if ( valid ) {
                    
                    var self = this;                    
                    this.$store.dispatch('saveUser', this.editedFields).then(function(){
                        self.editing = false;
                        UIkit.notification({
                            status : 'success',
                            message : userAccountLang[lang].userSaved
                        });
                    }).catch(function(err){
                        console.log(err);
                        UIkit.notification({
                            status : 'danger',
                            message : ffuShop.helpers.createErrorMsg( err.errors )
                        });
                    })
                }
            },
            
            
            // Pasword change
            
            changeView : function( field ) {
                
                var type = this.password[field].type;
                this.password[field].type = ( type == 'password' ? 'text' : 'password' );
            },
            
            repeatPassClass : function() {
                
                this.password.repeat.class = ( this.password.new.val != this.password.repeat.val ? 'uk-form-danger' : 'uk-form-success' );
            },
            
            resetRepeatPassClass : function() {
                
                this.password.repeat.class = '';
            },
            
            changePassword : function() {
                   
                if ( ! this.password.old.val ||
                     ! this.password.new.val ||
                     ! this.password.repeat.val ) {
                    
                    UIkit.notification({
                        status : 'warning',
                        message : userAccountLang[lang].emptyFields
                    });
                    
                } else if ( this.password.new.val !== this.password.repeat.val ) {
                    
                    UIkit.notification({
                        status : 'warning',
                        message : userAccountLang[lang].passMissMatch
                    });
                    
                } else {
                    
                    var self = this;
                    var data = {
                        old_password : this.password.old.val,
                        new_password : this.password.new.val
                    };

                    $.ajax({
                        url : ffuShop.routes.user.changePass.url,
                        type : ffuShop.routes.user.changePass.req,
                        dataType : 'json',
                        data : data,
                        success : function(res){
                            var status, message = '';
                            if ( res.errors &&
                                 ! $.isEmptyObject(res.errors) ) {
                                status = 'danger';
                                message = ffuShop.helpers.createErrorMsg( res.errors );
                            } else {
                                status = 'success';
                                message = res.message;
                                for ( p in self.password ) {
                                    self.password[p].val = '';
                                }
                            }
                            UIkit.notification({
                                status : status,
                                message : message
                            });
                        }
                    })
                }
            },
            
            
            // Orders
            
            getOrders : function() {
                
                var that = this;
                
                $.ajax({
                    url: ffuShop.routes.orders.all.url,
                    type: ffuShop.routes.orders.all.req,
                    dataType: 'json',
                    success: function(res){
                        if ( ! res || res.length == 0 ) return;
                        if ( res.errors &&
                             ! $.isEmptyObject(res.errors) ) {
                            UIkit.notification({
                                status : 'danger',
                                message : ffuShop.helpers.createErrorMsg( res.errors )
                            });
                        } else {
                            that.orders = res;
                        }                            
                    }
                })
            }
        },
        watch: {
            
            editing: function(isEditing) {
                
                if ( isEditing ) {
                    
                    var that = this;                    
                    var dpInt = setInterval(function(){
                        
                        if ( ! that.$refs.birthday && that.$refs.phone ) return;
                        
                        clearInterval(dpInt);
                                                                        
                        // create datepicher
                        $(that.$refs.birthday)
                            .datepicker({
                                changeMonth: true,
                                changeYear: true,
                                dateFormat: 'dd/mm/yy',
                                firstDay: 1,
                                maxDate: 0,
                            })
                            .on('change', ffuShop.helpers.nativeChange);
                        
                        // create phone mask
                        $(that.$refs.phone)
                            .mask('+38(999)999-99-99')
                            .on('change', ffuShop.helpers.nativeChange);
                        
                    }, 200)
                }
            },
            
            page: function( page ) {
                
                if ( this.orders !== null ) return;
                
                if ( page == 2 ) this.getOrders();
            }
        }
    })
}