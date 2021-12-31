#### A simple end to end encrypted notebook
Privacy is a right, an irrevocable entitlement held by all human beings from the moment of birth. However, the boundary has been crossed systematically over and over again, not to mention about a large population is still living under heavily monitoring and censorship.

This application is an End to End encrypted notebook that can only be viewed, edit, or shared by the permitted user. Unless the `E2E key` or your device is compromised, no one can view the content.

You can also use it as a regular notebook or a simple site builder, with markdown support. More information can be found at [Privapps Notebook Github](https://github.com/privapps/notebook)

#### Use Cases
* Use it as a personal private notebook. For example your daily, family secrects and etc.
* Personal lock box. You can put your private information such as passport number and etc.
* Share your notes to some of your friends with limited time.
* Maybe more that not listed above.

##### App Demo
[![](https://privapps.github.io/notebook_m.jpg)](https://d.tube/#!/v/n0teb00k.privapps/QmXY3YD71CpFnQEMVa64aDeLUgGiEfKAqNMomyqahiEund)

#### How it work
* You create or modify the notebook at your browser from the local computer. Then you can choose to save it as a file, or publish to the web.
* If you save to a file, you can choose as plain text or enrypted. If you choose to publish to the web, 
* `E2E key` is used for end-to-end encrypting or decrypting the content. If you don't set that, it would be used as a regular notebook. Note, even if there is no `E2E key`, from the server-side, the system administrator, network monitor are still not able to decrypt the content, because the encryption and decryption is happening at your **browser**.
* This notebook is fully integrated with [privatebin](https://privatebin.info/). You can save the data at privatebin, then decrypt and view it from this app.

##### Use file as storage
You can read or write a notebook and then save or load from a local file
* `E2E key` is strongly recommended as it gives a better protection
* Once you load the content, you can modify the note or save it with a different `E2E key`

##### Use it from the web
* When creating it, you can write a notebook start from scratch or load it from a pre-saved file
* There are two ways you can share the notebook

  1. If this app is configured with privatebin, you can directly save it from the app. Then the shareable URL would appear at the top right of your screen.
  2. You can also gather the note data and publish it to a public available privatebin. This app can load from the public URL, and translate it into another URL that you can share.

##### WARNING !!!
When you editing a notebook all your working data is in memory, if you refresh the page, go to another site, or close your browser, all your data would be **lost**

##### Any feedbacks?
We would love to hear your opinions. Please let us know from [Feedback From](https://public.biaomail.us.to/stdv.php?id=MTQ=)
