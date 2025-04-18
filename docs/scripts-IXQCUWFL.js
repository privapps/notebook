"use strict";(function(){let K;async function A(){if(K)return K;const V=7,R=-1,C=32*1024,I={},B=new WebAssembly.Memory({initial:1,maximum:1024}),F={memory:B,writeToJs(a,e){I[a].onData(new Uint8Array(B.buffer,W,e))},_abort:a=>{console.error(`Error: ${a}`)},_grow:()=>{}};let M;typeof fetch>"u"?M=fs.readFileSync("zlib-1.2.11.wasm"):M=await(await fetch("assets/css/zlib-1.2.11.wasm")).arrayBuffer();const D=await WebAssembly.compile(M),d=await WebAssembly.instantiate(D,{env:F}),T=d.exports._malloc(C),W=d.exports._malloc(C);class _{constructor(){this.zstreamPtr=d.exports._createDeflateContext(V,R),I[this.zstreamPtr]=this,this.offset=0,this.buff=new Uint8Array(C)}deflate(e,r){new Uint8Array(B.buffer,T,e.length).set(e),d.exports._deflate(this.zstreamPtr,T,W,e.length,C,r)}onData(e){if(this.buff.length<this.offset+e.length){const r=this.buff;this.buff=new Uint8Array(this.buff.length*2),this.buff.set(r)}this.buff.set(e,this.offset),this.offset+=e.length}destroy(){d.exports._freeDeflateContext(this.zstreamPtr),delete I[this.zstreamPtr],this.buff=null}getBuffer(){const e=new Uint8Array(this.offset);for(let r=0;r<this.offset;++r)e[r]=this.buff[r];return e}}class f{constructor(){this.zstreamPtr=d.exports._createInflateContext(R),I[this.zstreamPtr]=this,this.offset=0,this.buff=new Uint8Array(C)}inflate(e){new Uint8Array(B.buffer,T,e.length).set(e),d.exports._inflate(this.zstreamPtr,T,W,e.length,C)}onData(e){if(this.buff.length<this.offset+e.length){const r=this.buff;this.buff=new Uint8Array(this.buff.length*2),this.buff.set(r)}this.buff.set(e,this.offset),this.offset+=e.length}destroy(){d.exports._freeInflateContext(this.zstreamPtr),delete I[this.zstreamPtr],this.buff=null}getBuffer(){const e=new Uint8Array(this.offset);for(let r=0;r<this.offset;++r)e[r]=this.buff[r];return e}}return K={inflate(a){const e=new f;for(let s=0;s<a.length;s+=C){const o=Math.min(s+C,a.length),c=a.subarray(s,o);e.inflate(c)}const r=e.getBuffer();return e.destroy(),r},deflate(a){const e=new _;for(let s=0;s<a.length;s+=C){const o=Math.min(s+C,a.length),c=a.subarray(s,o);e.deflate(c,a.length<=s+C)}const r=e.getBuffer();return e.destroy(),r}},K}this.zlib=A()}).call(this),function(K){var A=32768,V=0,R=1,C=2,I=9,B=6,F=32768,M=64,D,d,T=null,W,_,f,a,e,r,s,o,c,p,u,g,x,rt,ft,wt=new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535),st=new Array(3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0),ot=new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99),lt=new Array(1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577),ut=new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13),ht=new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15),ct=function(){this.next=null,this.list=null},vt=function(){this.e=0,this.b=0,this.n=0,this.t=null},tt=function(b,y,v,t,n,h){this.BMAX=16,this.N_MAX=288,this.status=0,this.root=null,this.m=0;{var J,E=new Array(this.BMAX+1),$,X,H,w,i,l,Z,G=new Array(this.BMAX+1),O,P,L,U=new vt,k=new Array(this.BMAX),it=new Array(this.N_MAX),N,Y=new Array(this.BMAX+1),et,j,Q,at,q;for(q=this.root=null,i=0;i<E.length;i++)E[i]=0;for(i=0;i<G.length;i++)G[i]=0;for(i=0;i<k.length;i++)k[i]=null;for(i=0;i<it.length;i++)it[i]=0;for(i=0;i<Y.length;i++)Y[i]=0;$=y>256?b[256]:this.BMAX,O=b,P=0,i=y;do E[O[P]]++,P++;while(--i>0);if(E[0]==y){this.root=null,this.m=0,this.status=0;return}for(l=1;l<=this.BMAX&&E[l]==0;l++);for(Z=l,h<l&&(h=l),i=this.BMAX;i!=0&&E[i]==0;i--);for(H=i,h>i&&(h=i),j=1<<l;l<i;l++,j<<=1)if((j-=E[l])<0){this.status=2,this.m=h;return}if((j-=E[i])<0){this.status=2,this.m=h;return}for(E[i]+=j,Y[1]=l=0,O=E,P=1,et=2;--i>0;)Y[et++]=l+=O[P++];O=b,P=0,i=0;do(l=O[P++])!=0&&(it[Y[l]++]=i);while(++i<y);for(y=Y[H],Y[0]=i=0,O=it,P=0,w=-1,N=G[0]=0,L=null,Q=0;Z<=H;Z++)for(J=E[Z];J-- >0;){for(;Z>N+G[1+w];){if(N+=G[1+w],w++,Q=(Q=H-N)>h?h:Q,(X=1<<(l=Z-N))>J+1)for(X-=J+1,et=Z;++l<Q&&!((X<<=1)<=E[++et]);)X-=E[et];for(N+l>$&&N<$&&(l=$-N),Q=1<<l,G[1+w]=l,L=new Array(Q),at=0;at<Q;at++)L[at]=new vt;q==null?q=this.root=new ct:q=q.next=new ct,q.next=null,q.list=L,k[w]=L,w>0&&(Y[w]=i,U.b=G[w],U.e=16+l,U.t=L,l=(i&(1<<N)-1)>>N-G[w],k[w-1][l].e=U.e,k[w-1][l].b=U.b,k[w-1][l].n=U.n,k[w-1][l].t=U.t)}for(U.b=Z-N,P>=y?U.e=99:O[P]<v?(U.e=O[P]<256?16:15,U.n=O[P++]):(U.e=n[O[P]-v],U.n=t[O[P++]-v]),X=1<<Z-N,l=i>>N;l<Q;l+=X)L[l].e=U.e,L[l].b=U.b,L[l].n=U.n,L[l].t=U.t;for(l=1<<Z-1;(i&l)!=0;l>>=1)i^=l;for(i^=l;(i&(1<<N)-1)!=Y[w];)N-=G[w],w--}this.m=G[1],this.status=j!=0&&H!=1?1:0}},bt=function(){return rt.length==ft?-1:rt.charCodeAt(ft++)&255},z=function(b){for(;e<b;)a|=bt()<<e,e+=8},S=function(b){return a&wt[b]},m=function(b){a>>=b,e-=b},nt=function(b,y,v){var t,n,h;if(v==0)return 0;for(h=0;;){for(z(g),n=p.list[S(g)],t=n.e;t>16;){if(t==99)return-1;m(n.b),t-=16,z(t),n=n.t[S(t)],t=n.e}if(m(n.b),t==16){if(d&=A-1,b[y+h++]=D[d++]=n.n,h==v)return v;continue}if(t==15)break;for(z(t),o=n.n+S(t),m(t),z(x),n=u.list[S(x)],t=n.e;t>16;){if(t==99)return-1;m(n.b),t-=16,z(t),n=n.t[S(t)],t=n.e}for(m(n.b),z(t),c=d-n.n-S(t),m(t);o>0&&h<v;)o--,c&=A-1,d&=A-1,b[y+h++]=D[d++]=D[c++];if(h==v)return v}return r=-1,h},pt=function(b,y,v){var t;if(t=e&7,m(t),z(16),t=S(16),m(16),z(16),t!=(~a&65535))return-1;for(m(16),o=t,t=0;o>0&&t<v;)o--,d&=A-1,z(8),b[y+t++]=D[d++]=S(8),m(8);return o==0&&(r=-1),t},yt=function(b,y,v){if(T==null){var t,n=new Array(288),h;for(t=0;t<144;t++)n[t]=8;for(;t<256;t++)n[t]=9;for(;t<280;t++)n[t]=7;for(;t<288;t++)n[t]=8;if(_=7,h=new tt(n,288,257,st,ot,_),h.status!=0)return alert("HufBuild error: "+h.status),-1;for(T=h.root,_=h.m,t=0;t<30;t++)n[t]=5;if(zip_fixed_bd=5,h=new tt(n,30,0,lt,ut,zip_fixed_bd),h.status>1)return T=null,alert("HufBuild error: "+h.status),-1;W=h.root,zip_fixed_bd=h.m}return p=T,u=W,g=_,x=zip_fixed_bd,nt(b,y,v)},dt=function(b,y,v){var t,n,h,J,E,$,X,H,w=new Array(316),i;for(t=0;t<w.length;t++)w[t]=0;if(z(5),X=257+S(5),m(5),z(5),H=1+S(5),m(5),z(4),$=4+S(4),m(4),X>286||H>30)return-1;for(n=0;n<$;n++)z(3),w[ht[n]]=S(3),m(3);for(;n<19;n++)w[ht[n]]=0;if(g=7,i=new tt(w,19,19,null,null,g),i.status!=0)return-1;for(p=i.root,g=i.m,J=X+H,t=h=0;t<J;)if(z(g),E=p.list[S(g)],n=E.b,m(n),n=E.n,n<16)w[t++]=h=n;else if(n==16){if(z(2),n=3+S(2),m(2),t+n>J)return-1;for(;n-- >0;)w[t++]=h}else if(n==17){if(z(3),n=3+S(3),m(3),t+n>J)return-1;for(;n-- >0;)w[t++]=0;h=0}else{if(z(7),n=11+S(7),m(7),t+n>J)return-1;for(;n-- >0;)w[t++]=0;h=0}if(g=I,i=new tt(w,X,257,st,ot,g),g==0&&(i.status=1),i.status!=0)return i.status==1,-1;for(p=i.root,g=i.m,t=0;t<H;t++)w[t]=w[t+X];return x=B,i=new tt(w,H,0,lt,ut,x),u=i.root,x=i.m,x==0&&X>257||(i.status==1,i.status!=0)?-1:nt(b,y,v)},_t=function(){var b;D==null&&(D=new Array(2*A)),d=0,a=0,e=0,r=-1,s=!1,o=c=0,p=null},gt=function(b,y,v){var t,n;for(t=0;t<v;){if(s&&r==-1)return t;if(o>0){if(r!=V)for(;o>0&&t<v;)o--,c&=A-1,d&=A-1,b[y+t++]=D[d++]=D[c++];else{for(;o>0&&t<v;)o--,d&=A-1,z(8),b[y+t++]=D[d++]=S(8),m(8);o==0&&(r=-1)}if(t==v)return t}if(r==-1){if(s)break;z(1),S(1)!=0&&(s=!0),m(1),z(2),r=S(2),m(2),p=null,o=0}switch(r){case 0:n=pt(b,y+t,v-t);break;case 1:p!=null?n=nt(b,y+t,v-t):n=yt(b,y+t,v-t);break;case 2:p!=null?n=nt(b,y+t,v-t):n=dt(b,y+t,v-t);break;default:n=-1;break}if(n==-1)return s?0:-1;t+=n}return t},At=function(b){var y,v;_t(),rt=b,ft=0;for(var t=new Array(1024),n=[];(y=gt(t,0,t.length))>0;){var h=new Array(y);for(v=0;v<y;v++)h[v]=String.fromCharCode(t[v]);n[n.length]=h.join("")}return rt=null,n.join("")};K.RawDeflate||(K.RawDeflate={}),K.RawDeflate.inflate=At}(this),function(){this.baseX=function(A){if(A.length>=255)throw new TypeError("Alphabet too long");var V=new Uint8Array(256);V.fill(255);for(var R=0;R<A.length;R++){var C=A.charAt(R),I=C.charCodeAt(0);if(V[I]!==255)throw new TypeError(C+" is ambiguous");V[I]=R}var B=A.length,F=A.charAt(0),M=Math.log(B)/Math.log(256),D=Math.log(256)/Math.log(B);function d(_){if(_.length===0)return"";for(var f=0,a=0,e=0,r=_.length;e!==r&&_[e]===0;)e++,f++;for(var s=(r-e)*D+1>>>0,o=new Uint8Array(s);e!==r;){for(var c=_[e],p=0,u=s-1;(c!==0||p<a)&&u!==-1;u--,p++)c+=256*o[u]>>>0,o[u]=c%B>>>0,c=c/B>>>0;if(c!==0)throw new Error("Non-zero carry");a=p,e++}for(var g=s-a;g!==s&&o[g]===0;)g++;for(var x=F.repeat(f);g<s;++g)x+=A.charAt(o[g]);return x}function T(_){if(typeof _!="string")throw new TypeError("Expected String");if(_.length===0)return"";var f=0;if(_[f]!==" "){for(var a=0,e=0;_[f]===F;)a++,f++;for(var r=(_.length-f)*M+1>>>0,s=new Uint8Array(r);_[f];){var o=V[_.charCodeAt(f)];if(o===255)return;for(var c=0,p=r-1;(o!==0||c<e)&&p!==-1;p--,c++)o+=B*s[p]>>>0,s[p]=o%256>>>0,o=o/256>>>0;if(o!==0)throw new Error("Non-zero carry");e=c,f++}if(_[f]!==" "){for(var u=r-e;u!==r&&s[u]===0;)u++;for(var g=[],x=a;u!==r;)g[x++]=s[u++];return g}}}function W(_){var f=T(_);if(f)return f;throw new Error("Non-base"+B+" character")}return{encode:d,decodeUnsafe:T,decode:W}}}.call(this);/**
 * PrivateBin
 *
 * a zero-knowledge paste bin
 *
 * @see       {@link https://github.com/PrivateBin/PrivateBin}
 * @copyright 2012 Sébastien SAUVAGE ({@link http://sebsauvage.net})
 * @license   {@link https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License}
 * @version   1.3.4
 * @name      PrivateBin
 * @namespace
 */let PrivateBin=function(K){"use strict";let A;return{CryptTool:function(){A=zlib.catch(function(){console.log("zlib has some issues")});const R={};let C=new baseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");function I(f){return decodeURIComponent(f.split("").map(function(a){return"%"+("00"+a.charCodeAt(0).toString(16)).slice(-2)}).join(""))}function B(f){return encodeURIComponent(f).replace(/%([0-9A-F]{2})/g,function(a,e){return String.fromCharCode("0x"+e)})}function F(f){const a=new Uint8Array(f);let e="",r=0;for(;r<a.length;)e+=String.fromCharCode(a[r++]);return e}function M(f){const a=new Uint8Array(f.length);for(let e=0;e<f.length;++e)a[e]=f.charCodeAt(e);return a}async function D(f,a,e){if(f=M(B(f)),a==="zlib"){if(typeof e>"u")throw"Error compressing paste, due to missing WebAssembly support.";return e.deflate(f).buffer}return f}async function d(f,a,e){if(a==="zlib"||a==="none"){if(a==="zlib"){if(typeof e>"u")throw"Error decompressing paste, due to missing WebAssembly support.";f=e.inflate(new Uint8Array(f)).buffer}return I(F(f))}return typeof Base64>"u"?I(K.inflate(I(atob(F(f))))):Base64.btou(K.inflate(Base64.fromBase64(F(f))))}function T(f){let a="";const e=new Uint8Array(f);window.crypto.getRandomValues(e);for(let r=0;r<f;++r)a+=String.fromCharCode(e[r]);return a}async function W(f,a,e){let r=M(f);if(a.length>0){if(e[7]==="rawdeflate"){let p=await window.crypto.subtle.digest({name:"SHA-256"},M(B(a)));a=Array.prototype.map.call(new Uint8Array(p),u=>("00"+u.toString(16)).slice(-2)).join("")}let o=M(a),c=new Uint8Array(r.length+o.length);c.set(r,0),c.set(o,r.length),r=c}const s=await window.crypto.subtle.importKey("raw",r,{name:"PBKDF2"},!1,["deriveKey"]);return window.crypto.subtle.deriveKey({name:"PBKDF2",salt:M(e[1]),iterations:e[2],hash:{name:"SHA-256"}},s,{name:"AES-"+e[6].toUpperCase(),length:e[3]},!1,["encrypt","decrypt"])}function _(f,a){return{name:"AES-"+a[6].toUpperCase(),iv:M(a[0]),additionalData:M(f),tagLength:a[4]}}return R.cipher=async function(f,a,e,r){let s=await A;const o="zlib",c=[T(16),T(8),1e5,256,128,"aes","gcm",o],p=[];for(let u=0;u<c.length;++u)p[u]=u<2?btoa(c[u]):c[u];return r.length===0?r=p:r[0]===null&&(r[0]=p),[btoa(F(await window.crypto.subtle.encrypt(_(JSON.stringify(r),c),await W(f,a,c),await D(e,o,s)))),r]},R.decipher=async function(f,a,e){let r,s,o,c,p=await A;if(e instanceof Array)r=JSON.stringify(e[1]),s=(e[1][0]instanceof Array?e[1][0]:e[1]).slice(),o=e[0];else if(typeof e=="string"){let u=JSON.parse(e);r=atob(u.adata),s=[u.iv,u.salt,u.iter,u.ks,u.ts,u.cipher,u.mode,"rawdeflate"],o=u.ct}else throw"unsupported message format";if(s[0]=atob(s[0]),s[1]=atob(s[1]),s[7]==="zlib"&&typeof p>"u")throw"Error decompressing paste, due to missing WebAssembly support.";try{c=await window.crypto.subtle.decrypt(_(r,s),await W(f,a,s),M(atob(o)))}catch(u){return console.error(u),""}try{return await d(c,s[7],p)}catch(u){return u}},R.getSymmetricKey=function(){return T(32)},R.base58encode=function(f){return C.encode(M(f))},R.base58decode=function(f){return F(C.decode(f))},R}()}}(RawDeflate);
