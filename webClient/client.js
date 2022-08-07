let logger = null;
let accessToken=0;


$(() => {
    logger = createLogger('#log');
    setup();
});

function setup() {
    //$('#btn01').on('click', () => getData('ok'));
    //$('#btn00').on('click', getDataWithAccessToken);
}

function myFetch(method, url, headers, data) {
    return new Promise((resolve, reject) => {
        const getDataCall = new XMLHttpRequest();
        XMLHttpRequest.withCredentials=true;
        getDataCall.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status >= 200 && this.status <= 299) {
                    resolve(this);
                } else {
                    reject(this);
                }
            }
        };
        getDataCall.open(method, ('http://localhost_1039' + url), true);
        for (let header in headers) {
            getDataCall.setRequestHeader(header, headers[header]);
        }
        getDataCall.send(data);
    });
}
function getDataWithAccessToken() {
    let methodauth = $('#methodauth').children("option:selected").val();
    let endpointauth = $('#endpointauth').val();
    logger.log(`---------------------------------------`);
    const getDataCall = new XMLHttpRequest();
    XMLHttpRequest.withCredentials=true;
    getDataCall.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let data = getDataCall.responseText;
                logger.success(`received data: ${data}`);
            } else {
                logger.error(`can not get data`);
            }
        }
    };
    getDataCall.open(methodauth, endpointauth, true);
    getDataCall.setRequestHeader('authorization', accessToken);
    getDataCall.send();
}

function clearTokens(){
    accessToken=0;
}

async function renewAccessToken(){
    try{
        logger.log("called renew AccessToken")
        let response = await myFetch('GET','/api/auth/accessToken',{ "content-type": "application/json" });
        accessToken = response && response.responseText;
        logger.log("renewed accessToken: "+accessToken);
    }catch(err){
        if(JSON.parse(err.responseText)['code']==401){
            window.location.assign('login.html');
        }else{
            logger.error(err.responseText);
        }
    }
}
async function handleError(err,tryToRenewAccessToken,runAfterTokenRenewal){
    let errMsg = err && err.responseText;
    logger.error(`api call failed, try to handle error: ${errMsg}`);
    if(tryToRenewAccessToken){
        if(err.status==401){
            await renewAccessToken();
            if(typeof runAfterTokenRenewal==='function'){
                logger.log('try to former action again ...');
            runAfterTokenRenewal();
            }
        }
    }
}