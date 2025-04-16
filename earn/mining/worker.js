importScripts('/crypto-js/crypto-js.js');
addEventListener('message', function (e) {
    const domain = e.data.domain;
    const last_hash = e.data.last_hash;
    const difficulty = e.data.difficulty;
    let startTime = new Date().getTime();
    for (let i = 0; i >= 0; i++) {
        let nonce = Math.floor(Math.random() * 100000000)
        //if (last_hash != currentLastHash || $scope.inProgress == false) return;
        let hash = CryptoJS.SHA256(last_hash + domain + nonce).toString()
        let hashMod = Number(BigInt("0x" + hash) % BigInt(difficulty))
        if (hashMod == 0) {
            postMessage({
                nonce: nonce,
                last_hash: last_hash,
                str: last_hash + domain + nonce,
                hash: CryptoJS.SHA256(last_hash + domain + nonce).toString(),
                speed: i / (new Date().getTime() - startTime) * 1000,
            });
            break;
        }
    }
});