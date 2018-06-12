jQuery(document).ready(function($){
        
    /*
     * Delivery tab
     */
    
    @@include('./src/js/Vue/components/UserInfoCheckout.js')
    
    @@include('./src/js/Vue/components/DeliveryCourier.js')
    
    @@include('./src/js/Vue/components/DeliveryNewPost.js')
    
    /*
    @include('./src/js/Vue/components/DeliveryNewPostNew.js')
     */


    @@include('./src/js/Vue/components/DeliverySelf.js')
    
    
    /*
     * Payment tab
     */
    
    @@include('./src/js/Vue/components/PaymentCreditCard.js')
    
    @@include('./src/js/Vue/components/PaymentCashOnDelivery.js')
    
    
    
    /*
     * Vue instance
     */
    
    ffuShop.checkout = new Vue({

        el: '#fsCheckout',
        store : ffuShop.store,
        data : {
            page : 0,
            scrollEl : UIkit.scroll('#fsCheckout',{
                offset : 60,
                duration : 300
            }),
            active : true
        },
        computed : {
            products : function() {
                return this.$store.getters.products;
            },
            user : function() {
                return this.$store.state.user;
            },
            delivery : function() {
                return this.$store.getters.delivery;
            },
            deliveryDetails : function() {
                return this.$store.getters.deliveryDetails;
            },
            payment : function() {
                return this.$store.getters.payment;
            },
            isDeliveryValid : function() {
                return this.$store.getters.deliveryValid;
            },
            cartTotal : function(){
                var q = 0, sum = 0,products=0;;

                for ( p in this.products ) {
                    if ( ! this.products[p].qty ) continue; // check initial state
                    q ++;
                    sum += this.products[p].qty * this.products[p].discountPrice;
                };

                products = sum;
                // include delivery cost
                if ( this.page > 0 ) sum += this.$store.getters.deliveryCost;

                // include payment cost
                if ( this.page > 1 ) sum += this.payment.providers[this.payment.active].cost;

                return { quantity : q, summ : Math.round(sum), products:Math.round(products) };
            }
        },
        methods : {                   

            transBeforeEnter : function(el) {
                el.style.display = 'none';
            },
            transEnter : function(el, done) {
                var that = this;
                $(el).delay(300).slideDown(function(){
                    UIkit.update(event = 'update');
                    if ( el.offsetHeight > window.innerHeight ) {
                        that.scrollEl.scrollTo(that.$el);
                    }
                    done();
                });
            },
            transLeave : function(el, done) {
                $(el).slideUp(done);
            },

            quantityChange : function(oldnum, num, rowId) {
                
                if ( oldnum == num && num == 1 ) {
                    
                    this.removeProduct( rowId );
                    
                } else {
                    
                    // set quantity
                    this.active = false;                
                    var payload = [rowId, num],
                        self = this;

                    this.$store.dispatch('setProductQuantity', payload)
                        .then(function(){
                            self.products[rowId].qty = num;
                            self.products[rowId].subtotal = num * self.products[rowId].price;
                        })
                        .catch(function(errMsg){
                            UIkit.notification({
                                status : 'warning',
                                message : errMsg
                            });
                        })
                        .finally(function(){
                            self.active = true;   
                        })
                }
            },

            removeProduct : function( rowId ) {

                var message = ffuShop.translation[ffuShop.translation.lang].removeCart.confirm + this.products[rowId].name + '?';

                var that = this;
                UIkit.modal.confirm(message,{
                    labels: {
                        ok: ffuShop.translation[ffuShop.translation.lang].removeCart.ok,
                        cancel: ffuShop.translation[ffuShop.translation.lang].removeCart.cancel
                    }
                }).then( function(){
                    that.active = false;
                    that.$store.dispatch('removeProduct', rowId )
                        .finally(function(){
                            that.active = true;
                        });
                }).catch(function(e){
                    if (typeof e == 'object') console.log(e)
                });
            },

            setPage : function( index, hard ) {

                if ( !hard && index < this.page ) {

                    this.page = index;

                } else if ( hard ) { 

                    this.page = index
                }
            },

            navClass : function( index ) {
                return index <= this.page ? 'uk-active' : null;
            },

            setDeliveryProvider : function( index ) {

                this.$store.commit('setDeliveryProvider', index );
            },

            setPaymentProvider : function( index ) {

                this.$store.commit('setPaymentProvider', index );
            },
            
            registerUser : function() {
                
                var user = $.extend({}, this.user),
                    state = this.$store.state;
                
                this.active = false;
                
                user.deliveryProviders = {};                
                for ( name in state.deliveryProviders ) {
                    var provider = state.deliveryProviders[name];
                    user.deliveryProviders[name] = {
                        options : provider.options,
                        valid : provider.valid
                    }
                }
                
                var self = this;
                
                return new Promise(function(resolve, reject){
                    $.ajax({
                        url : ffuShop.routes.cart.registerUser.url,
                        type : ffuShop.routes.cart.registerUser.req,
                        data : user,
                        dataType : 'json',
                        success : function(res) {
                            if ( $.isEmptyObject(res.errors) && res.is_active ) { 
                                resolve();
                            } else {
                                reject(res.errors);
                            }
                        },
                        error : function(err, text) {
                            ffuShop.helpers.errorReject(reject, err, text)
                        }
                    })
                })
                .finally(function(){
                    self.active = true;
                })
            },
            
            validateDelivery : function() {

                var valid = true,
                    self = this,
                    lang = ffuShop.translation.lang;                    
                    
                this.active = false;
                
                function processDeliveryValidation() {
                    
                    if ( ! self.isDeliveryValid ) {
                        UIkit.notification({
                            message : ffuShop.translation[lang].checkout.noDelivery,
                            status : 'danger'
                        });
                        valid = false;
                    }

                    if ( !valid ) {

                        $('.fs-transition-holder .fs-checkout-options').removeClass('fs-hide-danger');
                        setTimeout(function(){
                            $('.fs-transition-holder .fs-checkout-options').addClass('fs-hide-danger');
                            self.active = true;
                        }, 2000, self);
                        return;
                    }

                    self.setPage( self.page+1, true );
                    self.active = true;
                }
                
                if ( ! this.user.valid ) {
                    UIkit.notification({
                        message : ffuShop.translation[lang].checkout.noUser,
                        status : 'danger'
                    });
                    valid = false;                    
                } else if ( ! this.user.registered ) {
                    
                    // register user
                    this.registerUser()
                        .then(function(){
                            ffuShop.store.commit('setUserInfo', ['registered', true]);
                            processDeliveryValidation();
                        })
                        .catch(ffuShop.helpers.errorHandler);
                } else {
                    processDeliveryValidation();
                }
            },

            validatePayment : function() {
                this.setPage( this.page+1, true );
            },

            confirmOrder : function() {
                var order = this.$store.state.order;
                var self = this;
              
                //order.delivery.details = this.$store.getters.deliveryDetails;
                order.delivery.details = this.$store.getters.deliveryDetails;
                order.delivery.warehouse = this.$store.getters.deliveryDetailsWarehouse;
                order.delivery.cost = this.$store.getters.deliveryCost

                order.user = this.$store.state.user;
                order.products = this.$store.state.products;

                $.ajax({
                    type: ffuShop.routes.checkout.confirm.req,
                    url: ffuShop.routes.checkout.confirm.url,
                    data: order,
                    dataType: 'json',
                    success: function(res) {
                        
                        switch ( res.action ) {
                            
                            case 'redirect' :
                                location.href = res.url;
                                break;
                            case 'pay' :
                                var form = $(res.form);
                                form.appendTo( $('body') ).submit();
                                break;
                            case 'quantity' :
                                UIkit.notification({
                                    status : 'warning',
                                    message : res.message
                                });
                                self.$store.dispatch('getProducts');
                                break;
                        }
                    },
                    error : function(err, text) {
                        console.log(text, err);
                    }
                });
            }
        },
        /*created : function() {
            this.$store.dispatch('getUser')
        }*/
    })
})

var s="Понимает ли это Кыцюндер? Еще бы! Как никто другой. В феврале 2018 года состоялась встреча Тимошенко и Порошенко прямо в кабинете гаранта, которая длилась один час сорок минут. Большая часть времени была уделена теме самоустранения Юлии Владимировны из избирательной кампании. В этом случае Порошенко как бы гарантирует неприкосновенность Кыцюндеру и участие в парламентских выборах. Но если Тимошенко нарушит «конвенцию», то он, главком, нальет генпрокурору стакан, и она пойдет по пути своей бывшей депутатки Савченко. Посадка «нашей Нади» в марте текущего года продемонстрировала всю серьезность намерений европейского лидера.

    За что сажать Кыцюндера? В ГПУ очень популярна тема «французский вариант». Саркози знаете? Николя? Ну бывший президент Франции? Сидит, голубчик. Брал деньги у ныне покойного Каддафи. Причем, что характерно, до его убийства. Николя занимал должность министра внутренних дел, приехал в легендарную бедуинскую палатку Муаммара в 2005 году и попросил денег на избирательную кампанию 2007 года. Каддафи дал пятьдесят миллионов евро. Ради благого дела не жалко. Дело получилось громкое, огромный либералистический резонанс. Все-таки бывший президент Франции на цугундере. Не шутка.

    Причем здесь наша Юля? А примерно в то же время, что и Николя, она тоже наведалась в палатку Каддафи. Подарила ему древнюю саблю. Стороны обсудили постройку нового завода по перегонке то ли нефти в водоросли, то ли бензина в «Тамифлю». Не важно. Главное другое: почти одновременно с посадкой Саркози всплыл эпизод с Тимошенко. Арабское издание Asharq Al-Awsat опубликовало расследование, из которого следовало, что Тимошенко, будучи на должности премьера, взяла примерно четыре миллиона евро на мелкие расходы, связанные с выборами президента Украины в 2010 году. Личный помощник Каддафи персонально прилетел в Киев с плотно набитой сумкой, которую передал… Тут источники арабского издания не называют фамилию курьера Кыцюндера. А вот по данным Генеральной прокуратуры этим гонцом был не кто иной, как доверенное лицо Юлии Владимировны, почти «кассир партии» Александр Шепелев. На то время – депутат Блока Юлии Тимошенко.

    Совершенно случайно Шепелева зимой 2018 года обнаружили со сломанной челюстью в глухом украинском лесу. Нашли его сотрудники СБУ, что, согласитесь, абсолютная случайность. Ну мало ли эсбеушников по лесу шляются? Да сотни. Грибы надо заготовить, хворост, с…ка, собрать для обогрева центрального офиса. Шепелев вообще тот еще авантюрист. Он долго бегал как от СБУ, так и от «Интерпола». Обвиняется в массе разнообразных преступлений экономического и чисто уголовного характера: вывод миллиардов гривен из банковской системы нации, в том числе и через банк «Родовид», заказные убийства, финансовые пирамиды. Его досье является практически образцовым для элитного члена БЮТ. До последнего времени пребывал на территории РФ. Но что-то пошло не так: злые люди сломали ему челюсть и выкинули в глухом лесу Украины, где грибники из СБУ случайно нашли полузамерзшее тело.

    Шепелев буквально горит желанием дать показания против Кыцюндера, поскольку «испытывает к ней чувство сильной личной неприязни». Начал испытывать чувство давно, поскольку в 2011 году вышел из фракции БЮТ и показательно вступил в Партию регионов. Есть записи разговоров Шепелева, где он называет Юлю с…кой и предлагает «регионалам» свою помощь в ее посадке.

    Пазлы сходятся. Шепелев пока отдыхает в СИЗО СБУ. Возможно, он уже дал показания на Юлию Владимировну, поскольку она явно запаниковала. В конце марта, когда Рада давала согласие на арест Савченко, Тимошенко резко уехала в Израиль. До последнего времени она не была замечена в особой тяге к путешествию по святым местам. А тут буквально потянуло. Еще более интересным является тот факт, что в это же время в Израиль потянуло и беглого украинского олигарха Игоря Коломойского. Встречу Тимошенко и Коломойского подтвердили сразу несколько источников.

    Поскольку информации было реально мало, то я логично предположил о создании альянса Коломойского и Кыцюндера. Почему нет? Они знакомы еще с Днепропетровска, столько проектов вместе провернули – замучишься перечислять. Один из последних – феерический прорыв границы Саакашвили с последующей депортацией лидера «антибарыжного движения» в Польшу. Порошенко вывел Михо из игры, поэтому надо срочно мутить новую тему. Плюс финансирование будущей кампании.

    Но буквально в последние дни появились новые данные. Оказывается, Кыцюндер была в панике и просила Коломойского устроить ей встречу с главой «Моссада». Знает ли Беня главу «Моссада»? Идиотский вопрос. Спросите лучше, кого он там не знает. Встреча состоялась. Тимошенко просила помочь выкрутиться из истории с деньгами Каддафи. Ее выслушали, но отказали.

    После возвращения с Земли Обетованной Кыцюндер превратила офис на Туровской в неприступную (как ей кажется) крепость. Там все перетрясли на предмет наличия прослушивающих устройств и укрепления входных дверей. В «бункере» на Туровской Тимошенко провела целую серию встреч с влиятельными людьми. Мы-то думали, она переворот мутит. Ан нет: Юлия Владимировна искала выходы из сложного положения. С одной стороны, она всю жизнь мечтала о президентской табуретке. Почти на всех должностях побывала, включая премьер-министра, выигрывала парламентские выборы, а вот до президентства так и не дотянулась. И «приз» уже почти в руках, но… Суд – тюрьма – Качановка. Второй ходки она уже не переживет. И шанса выиграть президентские выборы после 2018 года тоже не будет. Пластические хирурги не дают никаких гарантий насчет того, что коса не отвалится и рот станет закрываться.

    Выбор у нее, мягко говоря, хреновый. Три варианта. Первый: пойти на условия Порошенко, слиться перед выборами и довольствоваться участием в парламентской кампании. Обидно. И далеко не факт, что ее допустят до выборов в Раду. Арсений Яценюк уже «рейданул» «Батькивщину». С большим трудом удалось прорваться в нынешний состав парламента. С Савченко во главе списка. Которая в настоящее время сидит.

    Второй: пойти ва-банк, рассчитывая, что Порошенко не успеет ее закрыть. Рискованно. Гарант проводит в настоящее время более чем активную зачистку перед выборами. Резок, как понос. Почует опасность – сразу нальет стакан Юре.

    Третий: «внезапный кидок». Это в духе Кыцюндера. Заключить «железное соглашение», усыпить бдительность и резко кинуть. Может прокатить. Но ведь и Петр Алексеевич действует в точно таком же стиле. Может «закрыть» вне зависимости от выполнения договоренностей.



    Поэтому Кыцюндер ведет себя в последнее время крайне осторожно. Занимается всякой ерундой, фактически подыгрывая Порошенко в вопросах псевдоотмены декларирования грантов «антикоррупционными актвистами» и «запрета строительства «Северного потока»-2». «Окно» для посадки Тимошенко у гаранта очень «узкое»: если до осени не пришьет дело, то Кыцюндер вполне может выкарабкаться.



