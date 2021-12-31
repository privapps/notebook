# Privapp :: Notebook

## A Simple End to End Encrypted Notebook / Website & Builder
Privacy is a right, an irrevocable entitlement held by all human beings from the moment of birth. However, the boundary has been crossed systematically over and over again, not to mention about a large population is still living under heavily monitoring and censorship.

This application is an End to End encrypted notebook that can only be viewed, edit, or shared by the permitted user. Unless the `E2E key` or your device is compromised, no one can view the content.

## Use cases
* Use it as a personal private notebook. For example your daily, family secrects and etc.
* Personal lock box. You can put your private information such as passport number and etc.
* Share your notes to some of your friends with limited time.
* Many more that are not listed here.

## App demo
[![](https://privapps.github.io/notebook_m.jpg)](https://d.tube/#!/v/n0teb00k.privapps/QmXY3YD71CpFnQEMVa64aDeLUgGiEfKAqNMomyqahiEund)

## Tip
- There is a `View All` utton, which show all pages together. You can use browser's search there to find the information you need
- If you want to make a link to another notebook, sometimes the browser won't refresh due to the routing did not change. You can add another ```/``` in front of ```/index.html``` to work around that.

## How it Work
* You create or modify the notebook at your browser from the local computer. Then you can choose to save it as a file, or publish to the web.
* If you save to a file, you can choose as plain text or enrypted. If you choose to publish to the web, 
* `E2E key` is used for end-to-end encrypting or decrypting the content. If you don't set that, it would be used as a regular notebook. Note, even if there is no `E2E key`, from the server-side, the system administrator, network monitor are still not able to decrypt the content, because the encryption and decryption is happening at your **browser**. And we strongly suggest to set password for better protection.
* This notebook is fully integrated with [privatebin](https://privatebin.info/). You can save the data at privatebin, then decrypt and view it from this app.

#### Use file as storage
You can read or write a notebook and then save or load from a local file
* `E2E key` is strongly recommended as it gives a better protection
* Once you load the content, you can modify the note or save it with a different `E2E key`

#### Use it from the web
* When creating it, you can write a notebook start from scratch or load it from a pre-saved file
* There are two ways you can share the notebook  
  1. If this app is configured with privatebin, you can directly save it from the app. Then the shareable URL would appear at the top right of your screen.
  2. You can also gather the note data and publish it to a public available privatebin. This app can load from the public URL, and translate it into another URL that you can share. Here is a list of public avaliable privatebin: https://github.com/PrivateBin/PrivateBin/wiki/PrivateBin-Instances-Directory

## Sample notes

- Here is a [Peppa pigs' simple trivial questions](https://privapps.github.io/notebooks/index.html#/notes/0/type,remote&url,data___peppa&symmetric,Hj84nE4pQW4iBXhXhGf3wNeHqtYzGsupFFZHYgDDffjw) without a password. And you need the answers from the simple one to open [Peppa pig's Advanced trivial questions](https://privapps.github.io/notebooks/index.html#/notes/0/type,remote&url,data___peppa2&symmetric,7rrxctQBPgKwfUuU5XrQLteScRpZvPX2jQ6pbRcsASGt)
- 中文问答 [00后不懂的事情](https://privapps.github.io/notebooks/index.html#/notes/0/type,remote&url,data___00&symmetric,5PQae51qE2E7e8KwqQERYkWYTcUntdWqH4Qn4LMKRj6d). 你必须答出来之前的题目才能够看 [巧问妙答和笑话](https://privapps.github.io/notebooks/index.html#/notes/0/type,remote&url,data___002&symmetric,253ZfcKR1KW3RZh35vYMybD1W4GoFHnh898L4ZbRUFDd)
- Of course, you can always [create a brand new notebook](https://privapps.github.io/notebooks/index.html#/notes/0/&new)

## Demo sites
Here are a few notebook sites public avaliable. They are mainly for demo purpose.

#### No backend
https://privapps.github.io/notebooks/  

The above one has no backend, which relays the notes to remote third party privatebin sites.

#### Privatebin in the same host
https://notebooks-privapps.mybluemix.net/

This one is similar as you host privately as a docker, within kubernetes or in cloud foundry. Note, this site is for demostration purpose, if the node died or recycled, data would be wiped out.

## Docker

You can also find docker images at https://hub.docker.com/u/privapps

See build details at https://github.com/privapps/notebook-docker-nginx-fpm-alpine-privatebin

## Feedbacks and suggestions
We would love to hear your opinions. Please let us know from [Feedback From](https://public.biaomail.us.to/stdv.php?id=MTQ=)

## Developer guide

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.7.

1. in the root folder, do
```npm i```
2. launch the privatebin docker, note here is using the port 9080
``` docker run -d --restart="always" --read-only -p 9080:8080 -v c:/temp/php:/app privatebin/nginx-fpm-alpine ```
3. check the following two files, one is for angular proxy and the other one is the configuration of the apps
```
\proxy.conf.json
\src\assets\config.json
```
4. start developing the app as a regular angular one
``` ng s --proxy-config proxy.conf.json ```

### Note
To accomplish copy the URL and share to other people, some charecter are replaced in the address bar after ```#```:
- ```/``` is replaced by ```___```
- ```=``` is replaced by ```,```
- ```?``` is replaced by ```---```

## Wish list
- [ ] Multi-languages menu and help doc
- [ ] Implement editiable backend, so existing notebook can be modified

## Please donate:
```
bitcoin:bc1qmyewq7mh03a3sd5zgvvg3y5sqgm5un3e7eayhq?time=1614371109
```
Thanks for helping the maintainance and further development of the apps. Please stand up to protect privacy, promote the freedom of speach and fight against censorship. 


