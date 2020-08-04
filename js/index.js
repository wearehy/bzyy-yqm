new Vue({
    el: '#app',
    data: {
        url: "https://api.baozaoyunyu.com/",
        mobile: null,
        password: null,
        verify: null,
        code: null,
        pDis: false, //是否可以填写邀请码
        getColor: false,
        countDown: '获取',
        eyeBool: false,

        ajaxCode: null,
        message: null,
        modalBool: false,
    },
    watch: {
        mobile(val) {
            (val && this.password && this.verify && this.code) ? this.getColor = true: this.getColor =
                false
        },
        password(val) {
            (this.mobile && val && this.verify && this.code) ? this.getColor = true: this.getColor =
                false
        },
        verify(val) {
            (this.mobile && this.password && val && this.code) ? this.getColor = true: this.getColor =
                false
        },
        code(val) {
            (this.mobile && this.password && this.verify && val) ? this.getColor = true: this.getColor =
                false
        },
        modalBool(val) {
            console.log(val)
        }

    },
    methods: {
        send() {
            let _this = this;
            if (this.countDown != '获取') {
                return false;
            } else if (this.mobile == '' || this.mobile == null) {
                _this.message = '请输入手机号';
                    _this.modalBool = true;
                setTimeout(() => {
                    _this.modalBool = false
                }, 3000);
            } else if (this.mobile && this.mobile.toString().length < 11) {
                _this.message = '请输入正确手机号';
                _this.modalBool = true;
                setTimeout(() => {
                    _this.modalBool = false
                }, 3000);
            } else {
                this.timer();

                let timestamp = (new Date()).valueOf().toString();

                let data = {
                    type: 2,
                    mobile: this.mobile
                }
                let type = 'POST'
                let query = ''
                let sign = this.calcSign(type == 'POST' ? data : query, timestamp);

                $.ajax({
                    type: type,
                    headers: {
                        'version': '1.0.0',
                        'timestamp': timestamp,
                        'sign': sign
                    },
                    contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                    url: this.url + 'sendSms',
                    data: data,
                    success: function (res) {

                        _this.ajaxCode = res.code;
                        _this.message = res.message;
                        _this.modalBool = true;
                        setTimeout(() => {
                            _this.modalBool = false
                        }, 3000);

                    }
                })
            }


        },
        //领取
        getFun() {
            _this = this;
            if (!this.getColor) return false;
            let timestamp = (new Date()).valueOf().toString(); //时间戳

            let data = {
                mobile: this.mobile, //手机号
                password: CryptoJS.HmacSHA1(this.password, "OT2NDh42").toString().toUpperCase(), //密码
                code: this.verify, //验证码
                inviteCode: this.code //邀请码
            }

            let type = 'POST'
            let query = ''
            let sign = this.calcSign(type == 'POST' ? data : query, timestamp);

            $.ajax({
                type: type,
                headers: {
                    'version': '1.0.0',
                    'timestamp': timestamp,
                    'sign': sign
                },
                contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                url: this.url + 'register',
                data: data,
                success: function (res) {
                    _this.ajaxCode = res.code;
                    _this.message = res.message;
                    _this.modalBool = true;
                    setTimeout(() => {
                        _this.modalBool = false
                    }, 3000);
                }
            })
        },
        // 显示密码
        eyeFun() {
            this.eyeBool = !this.eyeBool;

            this.eyeBool ? $('#password').attr('type', 'password') : $('#password').attr('type', 'text')
        },
        // 获取sign
        calcSign(data, timestamp) {

            var keys = [];
            for (var k in data) {
                keys.push(k);
            }
            keys.sort();


            var kv = [];
            for (var v of keys) {
                kv.push(data[v]);
            }
            var kvStr = kv.join('');

            var sign = CryptoJS.MD5(kvStr + CryptoJS.MD5(timestamp.substring(0, 8)).toString() +
                timestamp).toString();
            return sign;
        },
        // 获取url后面拼接
        request(paras) {
            var url = location.href;
            var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
            var paraObj = {}
            for (i = 0; j = paraString[i]; i++) {
                paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1,
                    j.length);
            }
            var returnValue = paraObj[paras.toLowerCase()];
            if (typeof (returnValue) == "undefined") {
                return "";
            } else {
                return returnValue;
            }
        },

        //倒计时
        timer() {
            let num = 60;
            this.countDown = num + 's';
            let interval = setInterval(() => {
                num--;
                this.countDown = num + 's';
                if (num == -1) {
                    this.countDown = '获取';
                    clearInterval(interval);
                }
            }, 1000);
        }
    },
    mounted() {
        this.code = this.request('code');
        (this.code == null || this.code == '') ? this.pDis = false: this.pDis = true;
    }
})