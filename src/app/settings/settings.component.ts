import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {BackboneService} from '../backbone.service'
import {NgbAlert ,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {Metadata, Config} from '../data_inteface'
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LegacyService } from '../legacy.service'
import { FormGroup, FormControl ,Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  is_loaded = false
  e2e_key: string = ''
  editable_params : string | undefined= ''
  editable_symmetric_key : string | undefined
  editable_published : boolean = false
  editable_edit_url: string = ''
  editiable_registed : string = ''
  file_s: string = ''
  metadata : Metadata = {} as Metadata
  ttl  = "1day"
  plain_text_full_data: string = ''
  remote_privatebin_data_url : string = ''
  config : Config = {} as Config
  e2e_popup_modal : NgbModalRef | undefined
  register_popup_modal : NgbModalRef | undefined
  e2e_popup_open : boolean = false
  can_retry = false;
  alert_message = '';
  note_page : number = 0

  userEmail = new FormGroup({
    email: new FormControl('',[Validators.required,
      Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])
  })

  @ViewChild("file_data", {static: false}) file_data: ElementRef = {} as ElementRef
  @ViewChild('shortAlert', {static: false}) short_alert: NgbAlert = {} as NgbAlert
  @ViewChild('accordion', {static: false}) accordion: any = {}
  @ViewChild('popE2EKey', {static: false}) pop_e2e_key: any = {}
  @ViewChild('popEmail', {static: false}) pop_email: any = {}
  

  private alert_subj = new Subject<string>();

  constructor(private service: BackboneService,
    private modalService: NgbModal,
    private legacy: LegacyService,
    private aRoute: ActivatedRoute) { 
    }

  async ngOnInit() {

    this.alert_subj.subscribe(message => this.alert_message = message);
    this.alert_subj.pipe(debounceTime(8000)).subscribe(() => {
      if (this.short_alert) {
        this.short_alert.close();
      }
    });

    this.aRoute.paramMap.subscribe(params => {
        if(params.get('extra')){
          this.service.set_parameters(params.get('extra'), this.service.notes.length <=0)
        }
      }
    );

    if(!await this.service.initial_loaded){
      await this.service.wait_till_ready()
    }
    
    this.note_page = Number(this.aRoute.snapshot.paramMap.get('page')) || 0

    this.config = this.service.config
    if(this.config.privatebin && this.config.privatebin.ttl_default){
      this.ttl = this.config.privatebin.ttl_default
    }    

    if(this.service.parameters.symmetric){
      this.editable_symmetric_key = this.service.parameters.symmetric
    }

    this.config = this.service.config

    this.is_loaded = this.service.notes.length > 0
    if(await this.initial_load()){
      return
    }
    this.is_loaded = true
    this.metadata = this.service.metadata
    this.editable_published = false
    if(this.service.parameters.type == 'ed' && this.service.parameters.server && this.service.parameters.id){
      this.editable_params = this.service.parameters.id + '#' + this.service.parameters.server
    }
    
    await new Promise(resolve => setTimeout(resolve, 10))
    if(this.accordion){
      if(this.service.parameters.type){
        this.accordion.toggle(this.service.parameters.type)
      }else if(this.config.default_setting_tab){
        this.accordion.toggle(this.config.default_setting_tab)
      }
    }
  }

  save_data(){
    this.service.save_privatebin_file(this.e2e_key);
  }

  handleFileInput() {
    const fileUpload = this.file_data.nativeElement.files[0]
    var reader = new FileReader();
    reader.onload = () => this.file_s = reader.result as string
    reader.readAsText(fileUpload);
  } 
  next(){
    this.service.update_top_menu(0, this.note_page)
  }

  set_load_other_host_privatebin(){
    const rp : string []= this.remote_privatebin_data_url.split('#')
    this.service.reset_parameters()
    const params = this.service.parameters
    params.type='remote'
    this.service.set_parameter_remote_url(rp[0])
    params.symmetric=rp[1]
    this.load_other_host_privatebin()
  }

  load_other_host_privatebin(){
    if(!this.service.parameters.url || !this.service.parameters.symmetric){
      throw new Error('Remote Url is missing')
    }
    const param = [this.service.get_parameter_remote_url(), this.service.parameters.symmetric]
    return this.load_privatebin('', param)
  }
  load_editable_privatebin(){
    if(!this.service.parameters.id){
      throw new Error('Missing required Info')
    }

    if(!this.config.editable){
      throw new Error('Missing editable server config')
    }
    if(!this.service.parameters.symmetric){
      this.service.parameters.symmetric = this.service.new_symmetric_key()
    }
    const param = [this.service.parameters.id, this.service.parameters.symmetric]
    const url = this.config.editable.url
    return this.load_privatebin(url + '?pasteid=', param)
  }
  load_same_host_privatebin(){
    if(this.config.privatebin == null){
      throw new Error('Privatebin not configured')
    }
    if(!this.service.parameters.id || !this.service.parameters.symmetric){
      throw new Error('Missing required Info')
    }
    const param = [this.service.parameters.id, this.service.parameters.symmetric]
    return this.load_privatebin( this.config.privatebin.url + '?pasteid=', param)
  }
  /** 
   * param: string [id, symmetric_key]
   */
  private load_privatebin(url_prefix: string, param: string[]): Subscription{
    const url = url_prefix + param[0]
    return this.service.load_privatebin_remotely(url, param[1],this.e2e_key,
      ()=> this.next(), () => this.request_new_password(), 
      ()=>this.handle_fail_decrypt(), (error:any)=>this.handle_fail_fetch(error))
  }

  private handle_fail_decrypt(){
    this.alert_subj.next('Failed to decrypt.')
    this.is_loaded = true
    this.can_retry = true
  }
  private handle_fail_fetch(error:any){
    const err_msg = error['statusText'] ? error.statusText : error['message'] ? error['message'] : ''
    this.alert_subj.next('Failed to contact remote server: ' + err_msg)
    this.is_loaded = true
  }

  publish_privatebin_remotely(){
    if(this.config.privatebin == null){
      throw new Error('Privatebin not configured')
    }
    let last_symmetric = this.service.parameters.symmetric
    this.service.parameters.symmetric = undefined // force a new key
    this.service.publish_privatebin(this.config.privatebin.url, this.e2e_key, (resp) => {
      if(resp['status'] && resp['status']== 1 ){
        this.handle_fail_fetch(resp)
        return
      }
      const params = this.service.parameters
      const r_url : string = resp['url']
      if(r_url && r_url.includes('https://')){
        console.log('forward to?: ', r_url)
        params.type = 'remote'
        delete params.id
        this.service.set_parameter_remote_url(r_url)
      } else {
        params.type = 'pb'
        const r_id = resp['id'] as string
        params.id = r_id
        delete params.url
      }
      this.next()
    }, error => {
      this.service.parameters.symmetric = last_symmetric
      this.handle_fail_fetch(error)
    }, false, this.ttl);
  }
  publish_editable(){
    const params = this.service.parameters
    const old_symmetric_key = params.symmetric
    this.editable_published = false
    if(this.config.editable == null){
      throw new Error('Editable not configured')
    }
    let user_p : string []
    if(this.editable_params && this.editable_params.length > 0){
      user_p = this.editable_params.split('#')
      params.id = user_p[0]
      params.server = user_p[1]
    }
    params.symmetric = this.editable_symmetric_key
    this.service.publish_privatebin(this.config.editable.url, this.e2e_key, 
      (resp) => {
        const params = this.service.parameters
        params.type = 'ed'
        params.id = resp['id'] as string
        delete params.url
        const self_url = this.service.get_self_url_prefix() + this.service.get_notes_url(this.note_page)
        this.editable_edit_url = self_url + "&server," + this.service.parameters.server
        this.editable_published = true
      }, error => {
        params.symmetric = old_symmetric_key
        this.handle_fail_fetch(error)
      }, true,'never');
  }

  load_from_file(){
    try{
      let data, conf
      if(this.file_s.startsWith('[[{"name"')){ // plain
        [data, conf] = JSON.parse(this.file_s)
        this.service.initial(data,conf)
        this.service.reset_parameters()
        this.service.is_editing = false
        this.next()
      } else if(this.file_s.startsWith('[["')){ // encrypted 
        if(this.e2e_key.length>0){
          let [cipher, skey] = JSON.parse(this.file_s)
          this.service.decipher_privatebin_file(cipher,skey,this.e2e_key,() => this.request_new_password())
          .then(json =>{
            [data, conf] = JSON.parse(json)
            this.service.initial(data,conf)
            this.service.reset_parameters()
            this.service.is_editing = false
            this.next()
          }).catch(e=> {
            this.alert_subj.next('Decrypt failed: ' + e)
          })
        }else{
          this.alert_subj.next('File encrypted! Need a key')
          return
        }
      } else {
        this.alert_subj.next('File unknown.')  
      }
    } catch (e){
      this.alert_subj.next('File loading failed!')
    }
  }
  create_notebook(){
    if(this.service.notes.length > 0 && !confirm("Existing unpublished data would be flushed out. Are you sure to proceed?")){
      return
    }
    this.service.initial_blank()
    this.service.reset_parameters()
    this.next() 
  }
  get_plain_text(){
    this.plain_text_full_data = JSON.stringify([this.service.notes,this.service.metadata])
  }

  initial_load(){
    if(this.is_loaded && !this.service.new_initial){
      return false
    }
    const param = this.service.parameters
    try{
      if(param.type==='pb'){
        this.load_same_host_privatebin()
        return true
      } else if(param.type==='ed' && this.service.new_register){
        this.service.new_register = false
        this.popup_editable_register();
        return true
      } else if(param.type==='ed' && !this.service.new_initial){
        this.load_editable_privatebin()
        return true
      } else if(param.type==='remote'){
        this.load_other_host_privatebin()
        return true
      } else if(this.service.new_initial){
        this.service.new_initial = false
        this.service.is_editing = true
        this.next()
        return true
      }
    } catch (e){
      this.alert_subj.next(e)
    }
    return false
  }

  async request_new_password():Promise<string>{
    this.e2e_popup_modal = this.modalService.open(this.pop_e2e_key)
    this.e2e_popup_open = true
    await  this.e2e_popup_modal.closed.toPromise().then(()=>this.e2e_popup_open=false)
    return this.e2e_key
  }

  can_publish() : boolean{
    return this.service.notes.length > 0
  }
  can_editable_publish() : boolean {
    if(!this.editable_params || this.service.notes.length <= 0 || !this.editable_symmetric_key){
      return false
    }
    const params = this.editable_params.split('#')
    return params.length == 2
  }
  retry_password_with_last_remote_data(){
    this.request_new_password().then(()=>
      this.service.decipher_remote_data(this.service.parameters.symmetric as string, this.e2e_key,
        ()=> this.next(), () => this.request_new_password(), 
        ()=>this.handle_fail_decrypt())
    )
  }
  new_symmetric_key(){
    this.editable_symmetric_key = this.service.new_symmetric_key()
    this.editable_edit_url = ''
  }
  popup_editable_register(){
    if(!this.config.editable){
      this.alert_subj.next('Editable not configured')
      return
    }
    if(this.config.editable && true === this.config.editable.use_email){
      this.register_popup_modal = this.modalService.open(this.pop_email, {size: 'xl',backdrop:true })
    } else {
      this.service.editable_register('', (info)=>{
        this.service.parameters.type = 'ed'
        this.service.parameters.server = info['key']
        this.service.parameters.id = info['id']
        this.editable_params = this.service.parameters.id + '#' + this.service.parameters.server
      }, error => this.alert_subj.next('Fail to register ' + error))      
    }
  }
  editable_email_register(x:any){
    x['prefix'] = this.service.get_self_url_prefix()
    this.service.editable_register(x, ()=>{}, ()=>this.editiable_registed = 'F')
      .add(()=>this.editiable_registed='S')
  }
  is_unsupported_browser(){
    return this.legacy.isOldBrowser()
  }
  is_https(){
    return this.legacy.isSecureContext()
  }

}
