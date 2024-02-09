import * as forge from "node-forge";
import * as fs from "node:fs";


export default class SelfSigned {
    public static setupSelfSigned(sslMode = "./") {

        const certPath = "./generated-cert-1";

        if(fs.existsSync(certPath)) {
            return JSON.parse(fs.readFileSync(certPath, { encoding: "utf8", flag: "r" }));
        }

        let key;
        let cert;

        const pki = forge.default.pki;

        // generate a key pair or use one you have already
        const keys = pki.rsa.generateKeyPair(2048);

        // create a new certificate
        const crt = pki.createCertificate();

        // fill the required fields
        crt.publicKey = keys.publicKey;
        crt.serialNumber = '01';
        crt.validity.notBefore = new Date();
        crt.validity.notAfter = new Date();
        crt.validity.notAfter.setFullYear(crt.validity.notBefore.getFullYear() + 40);

        // use your own attributes here, or supply a csr (check the docs)
        const attrs = [
            {
                name: 'commonName',
                value: 'dev.socialmail.in'
            }, {
                name: 'countryName',
                value: 'IN'
            }, {
                shortName: 'ST',
                value: 'Maharashtra'
            }, {
                name: 'localityName',
                value: 'Navi Mumbai'
            }, {
                name: 'organizationName',
                value: 'NeuroSpeech Technologies Pvt Ltd'
            }, {
                shortName: 'OU',
                value: 'Test'
            }
        ];

        // here we set subject and issuer as the same one
        crt.setSubject(attrs);
        crt.setIssuer(attrs);

        // the actual certificate signing
        crt.sign(keys.privateKey);

        // now convert the Forge certificate to PEM format
        cert = pki.certificateToPem(crt);
        key = pki.privateKeyToPem(keys.privateKey);

        const json = { key, cert };
        fs.writeFileSync(certPath, JSON.stringify(json), "utf8");
        return json;
    }
}