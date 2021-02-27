export interface Note {
    name: string
    date?: Date
    content: string
}

export interface Metadata {
    name: string
    description: string
}
export interface PrivatebinConfig {
    url : string
    ttl? : TtlConfig []
    ttl_default? : string
}
export interface EditableConfig {
    url: string
    use_email? : boolean
}
export interface TtlConfig {
    name: string
    value: string
}
export interface Config {
    privatebin? : PrivatebinConfig
    editable? : EditableConfig
    default_setting_tab?: string
    app_root: string
}
export interface Parameters {
    type : string
    id? : string
    symmetric?: string
    url?: string
    server?: string
}
