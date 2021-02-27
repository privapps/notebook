import { Injectable } from '@angular/core';

declare let PrivateBin: any;

@Injectable({
  providedIn: 'root'
})
export class PrivatebinService {
  CryptTool = PrivateBin.CryptTool

  cipher(message: string, symmetricKey: string, password: string) : Promise<any>{
    let cipherMessage = {paste: message}
    let adata = [null, "plaintext", 0, 0]
    return this.CryptTool.cipher(symmetricKey, password, JSON.stringify(cipherMessage), adata)
  }

  decipher(cipher_result: any, bin_symmetricKey:string, password: string, handler: () => Promise<string>, retry: number): Promise<string>{
      return this.CryptTool.decipher(bin_symmetricKey, password, cipher_result)
      .then((decrypted:any) =>{
	if(!decrypted){
	  if( retry >= 0){
	    return handler().then(pwd =>{
	      return this.decipher(cipher_result, bin_symmetricKey, pwd, handler, retry-1)
	    })
	  }
	  return Promise.resolve('');
	}
	return JSON.parse(decrypted)['paste']
      })
   }
   getSymmetricKey() : string{
     return this.CryptTool.getSymmetricKey()
   }

   cipher_privatebin_data(message: string, bin_symmetricKey: string, password: string, ttl:string, ) : Promise<any>{
    let p_cipher_text = this.cipher(message, bin_symmetricKey,password);
    return p_cipher_text.then(cipher_result =>{
      const out_data :any = {}
      out_data['v'] = 2;
      out_data['ct'] = cipher_result[0];
      out_data['adata'] = cipher_result[1];
      out_data['meta'] ={"expire":ttl}
      return out_data
     })
   }
   key_from_base58(newKey: string) : string{
    return this.CryptTool.base58decode(newKey).padStart(32, '\u0000');
   }
   key_to_base58(key : any) : string{
    return this.CryptTool.base58encode(key)
   }
   decipher_privatebin_data(data_from_privatebin:any, base58_symmetricKey: string, password : string, handler: () => Promise<string>) : Promise<string>{
     const cipher_data = [data_from_privatebin['ct'], data_from_privatebin['adata']]
     const bin_key = this.key_from_base58(base58_symmetricKey)
     return this.decipher(cipher_data, bin_key, password, handler, 1)
   }

}
