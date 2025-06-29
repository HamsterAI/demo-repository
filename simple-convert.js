const bs58 = require('bs58');
const base58PrivateKey = 'dV8MCbLJsZDsFCrazbSoSATeKmgSCxJvnL2sn7HYoFgM1AjfBWuyuxwsueW2K5KA9Jmvw86mMFgKcfySKDur344';
console.log(Buffer.from(bs58.default.decode(base58PrivateKey)).toString('hex')); 