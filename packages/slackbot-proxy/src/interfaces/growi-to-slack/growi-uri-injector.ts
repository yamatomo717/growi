import { Req } from '@tsed/common';
import { SlackOauthReq } from '../slack-to-growi/slack-oauth-req';

export type GrowiUriWithOriginalData = {
  growiUri: string,
  originalData: string,
}

/**
 * Type guard for GrowiUriWithOriginalData
 * @param data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isGrowiUriWithOriginalData = (data: any): data is GrowiUriWithOriginalData => {
  return data.growiUri != null && data.originalData != null;
};

export interface GrowiUriInjector<IB, EP> {

  shouldHandleToInject(req: Req): boolean;
  inject(body: IB, growiUri:string): void;

  shouldHandleToExtract(req: Req & SlackOauthReq): boolean;
  extract(payload: EP): GrowiUriWithOriginalData;

}

export interface ObsoleteGrowiUriInjector {

  inject(body: any, growiUri:string): void;

  extract(body: any):any;
}
