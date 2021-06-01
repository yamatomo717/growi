import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';


const CustomBotWithoutProxySecretTokenSection = (props) => {
  const {
    appContainer, slackSigningSecret, slackBotToken, slackSigningSecretEnv, slackBotTokenEnv, onUpdatedSecretToken,
  } = props;
  const [inputSigningSecret, setInputSigningSecret] = useState(slackSigningSecret);
  const [inputBotToken, setBotToken] = useState(slackBotToken);
  const { t } = useTranslation();

  const currentBotType = 'customBotWithoutProxy';
  const updatedSecretToken = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/without-proxy/update-settings', {
        inputSigningSecret,
        inputBotToken,
        currentBotType,
      });

      if (onUpdatedSecretToken == null) {
        return;
      }
      onUpdatedSecretToken(inputSigningSecret, inputBotToken);
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setInputSigningSecret(slackSigningSecret);
    setBotToken(slackBotToken);
  }, [slackSigningSecret, slackBotToken]);
  return (
    <div className="w-75 mx-auto">

      <h3>Signing Secret</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={inputSigningSecret || ''}
            onChange={(e) => { setInputSigningSecret(e.target.value) }}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackSigningSecretEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
          </p>
        </div>

      </div>

      <h3>Bot User OAuth Token</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={inputBotToken || ''}
            onChange={(e) => { setBotToken(e.target.value) }}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackBotTokenEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_BOT_TOKEN' }) }} />
          </p>
        </div>

      </div>

      <AdminUpdateButtonRow onClick={updatedSecretToken} disabled={false} />

    </div>
  );
};

const CustomBotWithoutProxySecretTokenSectionWrapper = withUnstatedContainers(CustomBotWithoutProxySecretTokenSection, [AppContainer]);

CustomBotWithoutProxySecretTokenSection.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onUpdatedSecretToken: PropTypes.func,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
};

export default CustomBotWithoutProxySecretTokenSectionWrapper;
