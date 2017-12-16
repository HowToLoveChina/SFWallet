/**
 * Created by 837781 on 2016/8/3.
 */
define(['app'],function(app){
    //查询账户等级及额度
    app
    .factory('findAccountLevelAndQuotaService', ['$rootScope', '$http', 'NirvanaUtil',
        function ($rootScope, $http, NirvanaUtil) {
            return {
                query: function (mobile, businessScene) {
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);

                    var sign = NirvanaUtil.toSign({
                        "serviceName": "FIND_ACCOUNT_LEVEL_AND_QUOTA",
                        "mobile": mobile,
                        "platform": "H5",
                        "requestTime": requestTime
                    });
                    return $http({
                        method: 'POST',
                        data: {
                            mobile: NirvanaUtil.encrypt(mobile, key),
                            platform: NirvanaUtil.encrypt("H5", key),
                            businessScene: businessScene,
                            appType: "001",
                            serviceName: "FIND_ACCOUNT_LEVEL_AND_QUOTA",
                            charset: "UTF-8",
                            signType: "MD5",
                            requestTime: requestTime,
                            sign: sign
                        },
                        url: "h5-wallet-nirvana/memberInfo/findAccountLevelAndQuota"
                    });
                }
            };
        }])
});