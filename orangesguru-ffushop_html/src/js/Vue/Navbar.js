/*
 * Navbar
 */

ffuShop.navbar = new Vue({
    el: '#fsNavbar',
    store : ffuShop.store,
    data : function() {
        return {
            emptyMsg : ffuShop.translation[ ffuShop.translation.lang ].cartEmpty.message,
            active : true,
            modalSide : 'login',
            showErrors : false,
            fields : {
                first_name : '',
                last_name :  '',
                phone : '',
                email : '',
                password : ''                
            }
        }
    },
    computed : {
        products : function(){
            return this.$store.getters.products;
        },
        user : function(){
            return this.$store.getters.user;
        },
        cartTotal : function(){
            var q = 0, sum = 0 , i = 0;
            for ( p in this.products ) {
                i++;
                q += +this.products[p].qty;
                sum += this.products[p].qty * this.products[p].discountPrice;
            };
            return { 
                quantity : q,
                summ : Math.round(sum),
                uniqItems : i,
            };
        },
        fieldsValid : function() {
            
            return {
                first_name : !!this.fields.first_name && /^[a-zа-я ,.\'-]+$/i.test(this.fields.first_name),
                
                last_name : /^[a-zа-я ,.\'-]+$/i.test(this.fields.last_name),
                
                phone : !!this.fields.phone && /\+38\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}/.test(this.fields.phone),
                
                email : !!this.fields.email && /^([\w.*-]+@([\w-]+\.)+[\w-]{2,4})$/.test(this.fields.email), 
                
                password : this.fields.password.length > 3,
            }
        }
    },
    methods : {
        checkCart : function(e) {
            if ( $.isEmptyObject( this.products ) ) {
                UIkit.notification({
                    status: 'warning',
                    message: this.emptyMsg
                })
            } else {
                window.location = e.target.href;
            }
        },
        changeSide : function(side) {
            this.modalSide = side            
        },
        refresh : function() {
            UIkit.update(event = 'update');            
            if ( this.$refs.phone ) {
                var self = this;
                $(this.$refs.phone).mask('+38(999)999-99-99')
                                   .on('change', function(e){
                                            self.fields.phone = e.target.value;
                                        });
            }
        },
        userLogin : function() {
            
            if ( this.fieldsValid.email &&
                 this.fieldsValid.password ) {
                
                var data = {
                    email : this.fields.email,
                    password : this.fields.password
                }
                
                new Promise( function(resolve, reject){ 
                    $.ajax({
                        url : ffuShop.routes.user.auth.url,
                        method : ffuShop.routes.user.auth.req,
                        dataType : 'json',
                        data : data,
                        success : function( res ){
                            if ( ! res.errors ) {
                                resolve(res);
                            } else { reject(res.errors); }
                        },
                        error : function(err, text) {
                            ffuShop.helpers.errorReject(reject, err, text)
                        }
                    })
                }).then(function(res){
                    ffuShop.store.dispatch('getUser');
                    UIkit.modal('#fsLoginModal').hide();
                }).catch(ffuShop.helpers.errorHandler);
                
            } else {
                
                this.showErrors = true;
            }
        },
        userRegister : function() {
            
            var allValid = true;
            
            for ( field in this.fieldsValid ) {
                
                allValid = allValid && this.fieldsValid[field];
            }
            
            if ( allValid ) {
                
                this.active = false;
                var self = this;
                
                new Promise( function(resolve, reject){ 
                    $.ajax({
                        url : ffuShop.routes.user.register.url,
                        method : ffuShop.routes.user.register.req,
                        data : self.fields,
                        dataType : 'json',
                        success : function( res ){
                            if ( ! res.errors ) {
                                resolve(res);
                            } else { reject(res.errors); }
                        },
                        error : function(err, text) {
                            ffuShop.helpers.errorReject(reject, err, text)
                        }
                    })
                }).then(function(res){
                    UIkit.notification({
                        status : 'success',
                        message : res.message
                    });
                    UIkit.modal('#fsLoginModal').hide();
                }).catch(ffuShop.helpers.errorHandler)
                  .finally(function(){
                    self.active = true;
                });
                
            } else {
                
                this.showErrors = true;
            }
        },
        changePassword : function() {
            
            // check if email exist
            if ( ! this.fieldsValid.email ) {
                
                this.showErrors = true;
                
                UIkit.notification({
                    status : 'danger',
                    message : ffuShop.translation[ffuShop.translation.lang].user.changePasswordNoEmail
                });
                
                return;
            }
            
            // request password change
            this.active = false;
            var self = this;
            new Promise(function(resolve, reject){
                $.ajax({
                    url : ffuShop.routes.user.resetPass.url,
                    method : ffuShop.routes.user.resetPass.req,
                    data : self.fields,
                    dataType : 'json',
                    success : function( res ){
                        if ( ! res.errors ) {
                            resolve(res);
                        } else { reject(res.errors); }
                    },
                    error : function(err, text) {
                        ffuShop.helpers.errorReject(reject, err, text)
                    }
                })
            }).then(function(res){
                UIkit.notification({
                    status : 'success',
                    message : res.message
                });
                UIkit.modal('#fsLoginModal').hide();
            }).catch(ffuShop.helpers.errorHandler)
              .finally(function(){
                self.active = true;
            });
        }
    },
    created : function(){
         this.$store.dispatch('getProducts');
         this.$store.dispatch('getUser');
    },
    watch : {
        showErrors : function(on) {
            var self = this;
            if ( on ) setTimeout(function(){
                self.showErrors = false;
            }, 2000)
        }
    }
});