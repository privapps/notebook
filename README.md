# Privapp :: Notebook

## A Simple End-to-End Encrypted Notebook / Website & Builder

Privacy is a fundamental right, an irrevocable entitlement held by all human beings from the moment of birth. However, this boundary has been crossed systematically over and over again, and a large population still lives under heavy monitoring and censorship.

This application is an end-to-end encrypted notebook that can only be viewed, edited, or shared by authorized users. Unless the `E2E key` or your device is compromised, no one can view the content.

## Use Cases
* Use it as a personal private notebook. For example, for daily notes, family secrets, etc.
* Personal lockbox. You can store private information such as passport numbers, etc.
* Share your notes with some of your friends for a limited time.
* Many more possibilities not listed here.

## App Demo
[![](https://privapps.github.io/notebook_m.jpg)](https://d.tube/#!/v/n0teb00k.privapps/QmXY3YD71CpFnQEMVa64aDeLUgGiEfKAqNMomyqahiEund)

## Tips
- There is a `View All` button, which shows all pages together. You can use your browser's search feature there to find the information you need.
- If you want to make a link to another notebook, sometimes the browser won't refresh due to routing issues. You can add another `/` in front of `/index.html` to work around that.

## How It Works
* You create or modify the notebook in your browser on your local computer. Then you can choose to save it as a file or publish it to the web.
* If you save to a file, you can choose plain text or encrypted. If you choose to publish to the web:
  * The `E2E key` is used for end-to-end encryption or decryption of the content. If you don't set that, it would function as a regular notebook. Note that even without an `E2E key`, the system administrator or network monitor cannot decrypt the content because encryption and decryption occur in your **browser**. We strongly recommend setting a password for better protection.
* This notebook is fully integrated and compatible with [PrivateBin](https://privatebin.info/). You can save the data in PrivateBin and then decrypt and view it from this app.

### Using Files as Storage
You can read or write a notebook and then save or load from a local file.
* The `E2E key` is strongly recommended as it provides better protection.
* Once you load the content, you can modify the note or save it with a different `E2E key`.

### Using It from the Web
* When creating it, you can start writing a notebook from scratch or load it from a pre-saved file.
* There are two ways to share the notebook:
  1. If this app is configured with PrivateBin, you can directly save it from the app. Then the shareable URL will appear at the top right of your screen.
  2. You can also gather the note data and publish it to a publicly available PrivateBin. This app can load from the public URL and translate it into another URL that you can share. Here is a list of publicly available PrivateBins: https://github.com/PrivateBin/PrivateBin/wiki/PrivateBin-Instances-Directory

## Sample Notes
* Here is a [Peppa Pig's simple trivial questions](https://privapps.github.io/notebook/index.html#/notes/0/type,remote&url,data___peppa&symmetric,Hj84nE4pQW4iBXhXhGf3wNeHqtYzGsupFFZHYgDDffjw) without a password. And you need the answers from the simple one to open [Peppa Pig's Advanced trivial questions](https://privapps.github.io/notebook/index.html#/notes/0/type,remote&url,data___peppa2&symmetric,7rrxctQBPgKwfUuU5XrQLteScRpZvPX2jQ6pbRcsASGt).
* 中文问答 [00后不懂的事情](https://privapps.github.io/notebook/index.html#/notes/0/type,remote&url,data___00&symmetric,5PQae51qE2E7e8KwqQERYkWYTcUntdWqH4Qn4LMKRj6d). 你必须答出来之前的题目才能够看 [巧问妙答和笑话](https://privapps.github.io/notebook/index.html#/notes/0/type,remote&url,data___002&symmetric,253ZfcKR1KW3RZh35vYMybD1W4GoFHnh898L4ZbRUFDd).
* Of course, you can always [create a brand new notebook](https://privapps.github.io/notebook/index.html#/notes/0/&new).

## Demo Sites
Here are a few notebook sites publicly available. They are mainly for demo purposes.

#### No Backend
https://privapps.github.io/notebook/

There are two types of **No Backend**:
1. Relays the notes to remote third-party PrivateBin sites. If the third-party storage dies or recycles, data will be wiped out.
2. All your data is in your URL.

## Docker
You can also find Docker images at https://hub.docker.com/u/privapps

See build details at https://github.com/privapps/notebook-docker-nginx-fpm-alpine-privatebin

## Feedbacks and Suggestions
We would love to hear your opinions. Please let us know via our [Feedback Form](https://public.biaomail.us.to/stdv.php?id=MTQ=).

## Configuration
The configuration is located at `assets/config.json`.

## Server Side / Editable
You can use PrivateBin as a backend. Additionally, there is a custom-built backend that allows editing existing notebooks, making it like a wiki/blog. See details at:
https://github.com/privapps/notebook-docker-nginx-fpm-alpine-privatebin/

## Developer Guide
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.1.

1. In the root folder, do:
   ```npm ci```
2. Launch the PrivateBin Docker container (note: using port 9080):
   ```docker run -d --restart="always" --read-only -p 9080:8080 -v c:/temp/php:/app privatebin/nginx-fpm-alpine```
3. Check the following two files, one for Angular proxy and the other for the app configuration:
   ```
   \proxy.conf.json
   \src\assets\config.json
   ```
4. Start developing the app as a regular Angular one:
   ```ng s --proxy-config proxy.conf.json```
5. Release:
   ```ng build --aot --configuration production```

### Note
To accomplish copying the URL and sharing it with others, some characters are replaced in the address bar after `#`:
* `/` is replaced by `___`
* `=` is replaced by `,`
* `?` is replaced by `---`

If you have an encrypted file on your machine and don't want to or can't launch a web server, you can do:
```bash
inlinedata=$(cat "<encrypted_file>" | base64 -i - | sed 's'/\//./g')
# URL should be
# <prefix>#/notes/0/type,inline&symmetric,<key>&base64,<inlinedata>
```

## Wish List
- [x] Implement editable backend, so existing notebooks can be modified
- [x] All your data in your URL
- [x] Code highlight
- [ ] Mermaid URL

## Please Donate:
```
bitcoin:bc1qmyewq7mh03a3sd5zgvvg3y5sqgm5un3e7eayhq?time=1614371109
```
Thank you for helping with the maintenance and further development of the app. Please stand up to protect privacy, promote freedom of speech, and fight against censorship.
