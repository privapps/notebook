import { Injectable } from '@angular/core';
import { Config } from './data_inteface';

interface NotebookShareParameters {
  type: 'inline' | 'remote' | 'pb' | 'ed';
  symmetric: string;
  base64?: string;
  url?: string;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class NotebookLiteUrlConverterService {
  private readonly notebookLiteUrl = 'https://privapps.github.io/Notebook-lite/';

  convert(sourceUrl: string, config: Config, appOrigin: string): string {
    const params = this.parseNotebookWebUrl(sourceUrl);
    const source = params.type === 'inline'
      ? this.validateInlineData(params.base64 as string)
      : this.getStoredSourceUrl(params, config, appOrigin);

    return `${this.notebookLiteUrl}#${params.symmetric}@${encodeURIComponent(source)}`;
  }

  private parseNotebookWebUrl(sourceUrl: string): NotebookShareParameters {
    let url: URL;
    try {
      url = new URL(sourceUrl.trim());
    } catch {
      throw new Error('Enter a valid Notebook Web share URL.');
    }

    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const route = hash.startsWith('/') ? hash.slice(1) : hash;
    const routeMatch = route.match(/^notes\/\d+(?:\/(.*))?$/);
    if (!routeMatch) {
      throw new Error('The URL does not contain a Notebook Web notes share route.');
    }

    const values: Record<string, string> = {};
    const encodedParameters = routeMatch[1] ?? '';
    try {
      for (const part of encodedParameters.split('&')) {
        if (!part) continue;
        const comma = part.indexOf(',');
        if (comma < 1) continue;
        const key = part.slice(0, comma);
        values[key] = decodeURIComponent(part.slice(comma + 1));
      }
    } catch {
      throw new Error('The Notebook Web URL contains malformed encoded parameters.');
    }

    const type = values['type'];
    if (type !== 'inline' && type !== 'remote' && type !== 'pb' && type !== 'ed') {
      throw new Error(`Unsupported Notebook Web storage type: ${type || '(missing)'}.`);
    }
    if (!values['symmetric']) {
      throw new Error('The Notebook Web URL is missing its symmetric key.');
    }

    const params: NotebookShareParameters = { type, symmetric: values['symmetric'] };
    if (type === 'inline') {
      if (!values['base64']) throw new Error('The inline Notebook Web URL is missing its data.');
      params.base64 = values['base64'];
    } else if (type === 'remote') {
      if (!values['url']) throw new Error('The remote Notebook Web URL is missing its PrivateBin address.');
      params.url = this.decodeRemoteUrl(values['url'], url.href);
    } else {
      if (!values['id']) throw new Error('The Notebook Web URL is missing its paste ID.');
      params.id = values['id'];
    }
    return params;
  }

  private validateInlineData(value: string): string {
    try {
      const standardBase64 = value.replaceAll('.', '/');
      const envelope: unknown = JSON.parse(atob(standardBase64));
      if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope) ||
        typeof (envelope as Record<string, unknown>)['ct'] !== 'string' ||
        !Array.isArray((envelope as Record<string, unknown>)['adata'])) {
        throw new Error('Invalid encrypted envelope');
      }
      return value;
    } catch (error) {
      throw new Error(`The inline Notebook Web data is malformed: ${this.errorMessage(error)}`);
    }
  }

  private getStoredSourceUrl(params: NotebookShareParameters, config: Config, appOrigin: string): string {
    if (params.type === 'remote') return params.url as string;

    if (params.type === 'pb') {
      const privatebinUrl = config.privatebin?.url;
      if (!privatebinUrl) throw new Error('PrivateBin is not configured for this Notebook Web deployment.');
      return this.createPasteUrl(privatebinUrl, params.id as string, appOrigin, 'PrivateBin');
    }

    const editableUrl = config.editable?.url;
    if (!editableUrl) throw new Error('Editable storage is not configured for this Notebook Web deployment.');
    return this.createPasteUrl(editableUrl, params.id as string, appOrigin, 'Editable');
  }

  private decodeRemoteUrl(value: string, sourceUrl: string): string {
    // Notebook Web escapes slash and question-mark characters before placing a
    // remote PrivateBin address in its hash route. Accept both that format and
    // a normal percent-encoded URL.
    const decoded = value.replace(/---/g, '?').replace(/___/g, '/');
    let remoteUrl: URL;
    try {
      remoteUrl = new URL(decoded, sourceUrl);
    } catch {
      throw new Error('The remote Notebook Web URL contains an invalid PrivateBin address.');
    }
    if (remoteUrl.protocol !== 'https:' && remoteUrl.protocol !== 'http:') {
      throw new Error('The remote PrivateBin address must use HTTP or HTTPS.');
    }
    return remoteUrl.href;
  }

  private createPasteUrl(endpoint: string, id: string, appOrigin: string, storageName: string): string {
    let pasteUrl: URL;
    try {
      pasteUrl = new URL(endpoint, `${appOrigin}/`);
    } catch {
      throw new Error(`${storageName} endpoint is invalid.`);
    }
    if (pasteUrl.protocol !== 'http:' && pasteUrl.protocol !== 'https:') {
      throw new Error(`${storageName} endpoint must use HTTP or HTTPS.`);
    }
    pasteUrl.searchParams.set('pasteid', id);
    return pasteUrl.href;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
