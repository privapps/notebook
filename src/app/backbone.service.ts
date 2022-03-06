import { Injectable } from '@angular/core';
import { Metadata, Note, Config, Parameters } from './data_inteface'
import CryptoES from 'crypto-es';
import { PrivatebinService } from './privatebin.service'
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AppComponent } from './app.component'

@Injectable({
  providedIn: 'root'
})
export class BackboneService {
  metadata: Metadata = {} as Metadata
  notes: Note[] = []

  app: AppComponent = {} as AppComponent

  notes_ttl: Number = -1
  config: Config = { app_root: '/' }
  parameters: Parameters = { type: '' }
  initial_loaded = false
  last_remote_data: any
  is_editing = false
  new_initial = false
  new_register = false
  ed_server_ts = '0'
  last_content_hash = ''

  constructor(private privatebinService: PrivatebinService,
    private http: HttpClient,
    private router: Router) {
    this.getConfig().then(() => this.initial_loaded = true)
    new Promise(resolve => setTimeout(resolve, 800)).then(() => {
      if (!this.initial_loaded) {
        this.initial_loaded = true
        console.log('App take too long to get parameter. reset')
        this.update_top_menu(1)
      }
    })
  }

  getConfig(): Promise<void> {
    return this.http.get('assets/config.json')
      .toPromise().then(conf => {
        this.config = conf as Config
      }).catch(error => console.log(error))
  }

  note_position_up(i: number, up: boolean = true) {
    let p = this.notes[i]
    let o = up ? i - 1 : i + 1
    this.notes.splice(i, 1, this.notes[o]);
    this.notes.splice(o, 1, p);
  }
  delete_note(i: number) {
    this.notes.splice(i, 1);
  }
  private send_file(data: string, encrypted: boolean, file_name: string): void {
    const dlink: HTMLAnchorElement = document.createElement('a');
    dlink.download = file_name
    const prefix = encrypted ? 'data:application/octet-stream' : 'data:application/json'
    dlink.href = prefix + ';charset=utf-8,' + encodeURIComponent(data);
    dlink.click(); // this will trigger the dialog window
    dlink.remove();
  }
  get_w_hash(msg: string, w_key: string): string {
    return CryptoES.SHA256(msg + w_key).toString()
  }
  init_content_md5() {
    this.last_content_hash = this.get_content_md5();
  }
  get_content_md5(): string {
    const data = JSON.stringify([this.notes, this.metadata])
    return CryptoES.MD5(data).toString()
  }
  initial(data: Note[], conf: Metadata) {
    this.notes = data
    this.metadata = conf
    this.init_content_md5()
  }
  initial_blank() {
    this.notes = [{
      name: 'New',
      content: 'There is **nothing** here',
      date: new Date()
    }]
    this.metadata = {
      name: '',
      description: ''
    }
    this.is_editing = true
    this.init_content_md5()
  }
  is_content_changed() {
    return this.last_content_hash !== this.get_content_md5()
  }

  set_app(app: AppComponent): void {
    this.app = app
  }

  set_parameters(fragment: string | null, reload: boolean = false): void {
    if (fragment == null || fragment.length <= 0 || (!reload && this.initial_loaded)) {
      return
    }
    let map: any = {}
    fragment.split('&').forEach(e => {
      const pair = e.split(',')
      map[pair[0]] = pair[1]
    })

    if (map.hasOwnProperty('new')) {
      this.initial_blank();
      this.new_initial = true
      delete map.new
    } else if (map.hasOwnProperty('register')) {
      this.new_register = true
      delete map.register
    } else if (map.hasOwnProperty('url')) {
      map.url = decodeURI(map.url)
    }

    this.parameters = map as Parameters
    if (this.parameters.type == null || this.parameters.type.length <= 0) {
      this.parameters.type = 'pd'
    }
  }

  async update_top_menu(select: Number, page: number = 0) {
    this.app.top_menu.select(select)
    if (select === 0) {
      this.router.navigate(['notes', page, this.get_extra_url()]);
    }
  }
  save_privatebin_file(e2e_key: string) {
    const data = JSON.stringify([this.notes, this.metadata])
    if (e2e_key.length > 0) {
      const symmetricKey = this.privatebinService.getSymmetricKey()
      const p = this.privatebinService.cipher(data, symmetricKey, e2e_key);
      p.then(cipher => this.send_file(
        JSON.stringify([cipher, this.privatebinService.key_to_base58(symmetricKey)]), true, 'notebook.bin'))
    } else {
      this.send_file(data, false, 'notebook.json')
    }
  }
  decipher_privatebin_file(ciphertext: string, symmetricKey: string, password: string, handler: () => Promise<string>): Promise<string> {
    const bin_key = this.privatebinService.key_from_base58(symmetricKey)
    return this.privatebinService.decipher(ciphertext, bin_key, password, handler, 3)
  }
  publish_privatebin(url: string, e2e_key: string, success: (s: any) => any,
    update_failure_handler: (s: any) => any,
    editiable: boolean, ttl = '1day') {
    const data = JSON.stringify([this.notes, this.metadata])

    const bin_symmetricKey = this.parameters.symmetric ?
      this.privatebinService.key_from_base58(this.parameters.symmetric) : this.privatebinService.getSymmetricKey()
    if (!this.parameters.symmetric) {
      this.parameters.symmetric = this.privatebinService.key_to_base58(bin_symmetricKey)
    }
    const call_back = (x: any) => {
      this.is_editing = false
      const timestamp = x.headers.get('X-Timestamp')
      console.log(x, x.headers)
      this.ed_server_ts = timestamp == null ? '0' : timestamp
      success(x.body)
    }
    this.privatebinService.cipher_privatebin_data(data, bin_symmetricKey, e2e_key, ttl).then(arr => {
      if (!editiable) {
        this.http.post(url, arr).subscribe(call_back)
      } else {
        let post_data = JSON.stringify(arr)
        const hash = CryptoES.SHA256(post_data + this.parameters.server).toString()
        if (this.config.editable == null) {
          throw new Error('Editiable backend is not configured');
        }
        this.http.put(this.config.editable.url + '?pasteid=' + this.parameters.id, arr, {
          headers: {
            'X-Hash': hash,
            'X-Timestamp': this.ed_server_ts
          },
          observe: 'response'
        }).subscribe(call_back, error => update_failure_handler(error))
      }
    })
  }

  load_privatebin_remotely(url: string, e_s_key: string, e2e_key: string, success: Function,
    decipher_error_handler: () => Promise<string>, error_fun: Function, fetch_error_handler: (e: any) => any): Subscription {
    return this.http.get(url,{observe: 'response'})
    .subscribe((resp: any) => {
      const x = resp.body
      const timestamp = resp.headers.get('X-Timestamp')
      this.ed_server_ts = timestamp == null ? '0' : timestamp
      if (x.status && x.status == 1) {
        fetch_error_handler(x)
        return Promise.resolve()
      }
      this.last_remote_data = x
      this.notes_ttl = (x['meta'] != null && x['meta']['time_to_live'] != null) ? x['meta']['time_to_live'] : -1
      return this.decipher_remote_data(e_s_key, e2e_key, success, decipher_error_handler, error_fun)
    }, error => fetch_error_handler(error))
  }

  decipher_remote_data(e_s_key: string, e2e_key: string, success: Function,
    decipher_error_handler: () => Promise<string>, error_fun: Function): Promise<void> {
    return this.privatebinService.decipher_privatebin_data(this.last_remote_data, e_s_key, e2e_key,
      decipher_error_handler).then(text => {
        if (text) {
          const notebook_data: any[] = JSON.parse(text)
          this.notes = notebook_data[0]
          this.metadata = notebook_data[1]
          this.init_content_md5()
          success()
        } else {
          error_fun()
        }
      })
  }

  load_editable_privatebin_remotely(host_id: string, e_s_key: string, e2e_key: string,
    success: Function, decipher_error_handler: () => Promise<string>,
    error_fun: Function, fetch_error_handler: () => Promise<string>): Subscription {
    return this.load_privatebin_remotely(host_id, e_s_key, e2e_key, success,
      decipher_error_handler, error_fun, fetch_error_handler)
  }

  wait_till_ready(): Promise<any> {
    if (this.initial_loaded || (this.config.editable || this.config.privatebin) && this.parameters.type.length > 0) {
      this.initial_loaded = true
      return Promise.resolve()
    } else {
      return new Promise(resolve => setTimeout(resolve, 20)).then(() => this.wait_till_ready())
    }
  }

  get_extra_url() {
    let url = ''
    if (this.parameters.type == 'pb' || this.parameters.type == 'ed' ||
      this.parameters.type == 'remote') {
      const param: any = this.parameters
      let arr: string[] = []
      Object.keys(param).forEach(k => {
        if (k == 'server') {
          // don't show server key
        } else {
          arr.push(k + ',' + param[k]) // the address bar may cut of =, here is a work around
        }
      })
      url += arr.join('&')
    }
    return url
  }

  get_self_url_prefix() {
    let href = window.location.href
    let router_url = this.router.url
    return href.substr(0, href.length - router_url.length - 1)
  }

  reset_parameters() {
    if (this.parameters.type != 'ed') {
      this.parameters = { type: '' }
    }
  }
  new_symmetric_key(): string {
    return this.privatebinService.key_to_base58(this.privatebinService.getSymmetricKey())
  }
  editable_register(email: any, success: (e: any) => any,
    fetch_error_handler: (e: any) => any): Subscription {
    if (!this.config.editable) {
      throw new Error('Editable server not configured');
    }
    return this.http.post(this.config.editable.url, email)
      .subscribe((msg: any) => {
        success(msg)
      }, fetch_error_handler)
  }

  get_notes_url(page: number = 0) {
    return '#/notes/' + page + '/' + this.get_extra_url()
  }

  set_parameter_remote_url(s: string) {
    // the address bar may cut of the / so here do some replacement
    // encode works, but when some one copy the url bar and share to another one, and again the url encode would be gone
    this.parameters.url = encodeURIComponent(s.replace(/\//g, '___').replace(/\?/g, '---'))
  }
  get_parameter_remote_url(): string {
    if (!this.parameters.url) {
      return ''
    }
    // the address bar may cut of the // here revert things back
    return decodeURIComponent(this.parameters.url).replace(/---/g, '?').replace(/___/g, '/')
  }
}
