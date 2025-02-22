import {
  IMiddleware, Inject, Middleware, Next, Req, Res,
} from '@tsed/common';

import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { ViewInteractionPayloadDelegator } from '~/services/growi-uri-injector/ViewInteractionPayloadDelegator';
import { ActionsBlockPayloadDelegator } from '~/services/growi-uri-injector/ActionsBlockPayloadDelegator';


@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  @Inject()
  viewInteractionPayloadDelegator: ViewInteractionPayloadDelegator;

  @Inject()
  actionsBlockPayloadDelegator: ActionsBlockPayloadDelegator;

  use(@Req() req: SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    // There is no payload in the request from slack
    if (req.interactionPayload == null) {
      return next();
    }

    const payload = req.interactionPayload;

    if (this.viewInteractionPayloadDelegator.shouldHandleToExtract(payload)) {
      const data = this.viewInteractionPayloadDelegator.extract(payload);
      req.growiUri = data.growiUri;
    }
    else if (this.actionsBlockPayloadDelegator.shouldHandleToExtract(payload)) {
      const data = this.actionsBlockPayloadDelegator.extract(payload);
      req.growiUri = data.growiUri;
    }

    return next();
  }

}
