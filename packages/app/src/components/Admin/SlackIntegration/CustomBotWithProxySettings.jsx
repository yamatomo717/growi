import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import CustomBotWithProxyConnectionStatus from './CustomBotWithProxyConnectionStatus';
import WithProxyAccordions from './WithProxyAccordions';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';
import { SlackAppIntegrationControl } from './SlackAppIntegrationControl';

const logger = loggerFactory('growi:cli:SlackIntegration:CustomBotWithProxySettings');

const CustomBotWithProxySettings = (props) => {
  const {
    appContainer, slackAppIntegrations, proxyServerUri,
    onClickAddSlackWorkspaceBtn, onPrimaryUpdated,
    connectionStatuses, onUpdateTokens, onSubmitForm,
  } = props;
  const [newProxyServerUri, setNewProxyServerUri] = useState();
  const [integrationIdToDelete, setIntegrationIdToDelete] = useState(null);
  const [siteName, setSiteName] = useState('');
  const { t } = useTranslation();

  // componentDidUpdate
  useEffect(() => {
    setNewProxyServerUri(proxyServerUri);
  }, [proxyServerUri]);

  const addSlackAppIntegrationHandler = async() => {
    if (onClickAddSlackWorkspaceBtn != null) {
      onClickAddSlackWorkspaceBtn();
    }
  };

  const isPrimaryChangedHandler = useCallback(async(slackIntegrationToChange, newValue) => {
    // do nothing when turning off
    if (!newValue) {
      return;
    }

    try {
      await appContainer.apiv3.put(`/slack-integration-settings/slack-app-integrations/${slackIntegrationToChange._id}/make-primary`);
      if (onPrimaryUpdated != null) {
        onPrimaryUpdated();
      }
      toastSuccess(t('toaster.update_successed', { target: 'Primary' }));
    }
    catch (err) {
      toastError(err, 'Failed to change isPrimary');
      logger.error('Failed to change isPrimary', err);
    }
  }, [appContainer.apiv3, t, onPrimaryUpdated]);

  const deleteSlackAppIntegrationHandler = async() => {
    try {
      await appContainer.apiv3.delete(`/slack-integration-settings/slack-app-integrations/${integrationIdToDelete}`);
      if (props.onDeleteSlackAppIntegration != null) {
        props.onDeleteSlackAppIntegration();
      }
      toastSuccess(t('admin:slack_integration.toastr.delete_slack_integration_procedure'));
    }
    catch (err) {
      toastError(err, 'Failed to delete');
      logger.error('Failed to delete', err);
    }
  };

  const updateProxyUri = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/proxy-uri', {
        proxyUri: newProxyServerUri,
      });
      toastSuccess(t('toaster.update_successed', { target: 'Proxy URL' }));
    }
    catch (err) {
      toastError(err, 'Failed to update');
      logger.error('Failed to update', err);
    }
  };

  useEffect(() => {
    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);
  }, [appContainer]);

  return (
    <>
      <h2 className="admin-setting-header mb-2">{t('admin:slack_integration.custom_bot_with_proxy_integration')}
        <a href={t('admin:slack_integration.docs_url.custom_bot_with_proxy')} target="_blank" rel="noopener noreferrer">
          <i
            className="fa fa-external-link btn-link ml-2"
            aria-hidden="true"
          />
        </a>
      </h2>

      {slackAppIntegrations.length !== 0 && (
        <>
          <CustomBotWithProxyConnectionStatus
            siteName={siteName}
            connectionStatuses={connectionStatuses}
          />

          <div className="form-group row my-4">
            <label className="text-left text-md-right col-md-3 col-form-label mt-3">Proxy URL</label>
            <div className="col-md-6 mt-3">
              <input
                className="form-control"
                type="text"
                name="settingForm[proxyUrl]"
                defaultValue={newProxyServerUri}
                onChange={(e) => { setNewProxyServerUri(e.target.value) }}
              />
            </div>
            <div className="col-md-2 mt-3 text-center text-md-left">
              <button type="button" className="btn btn-primary" onClick={updateProxyUri}>{ t('Update') }</button>
            </div>
          </div>

          <h2 className="admin-setting-header">{t('admin:slack_integration.integration_procedure')}</h2>
        </>
      )}

      <div className="mx-3">
        {slackAppIntegrations.map((slackAppIntegration, i) => {
          const {
            tokenGtoP, tokenPtoG, _id, permissionsForBroadcastUseCommands, permissionsForSingleUseCommands,
          } = slackAppIntegration;
          const workspaceName = connectionStatuses[_id]?.workspaceName;
          return (
            <React.Fragment key={slackAppIntegration._id}>
              <div className="my-3 d-flex align-items-center justify-content-between">
                <h2 id={_id || `settings-accordions-${i}`}>
                  {(workspaceName != null) ? `${workspaceName} Work Space` : `Settings #${i}`}
                </h2>
                <SlackAppIntegrationControl
                  slackAppIntegration={slackAppIntegration}
                  onIsPrimaryChanged={isPrimaryChangedHandler}
                  // set state to open DeleteSlackBotSettingsModal
                  onDeleteButtonClicked={saiToDelete => setIntegrationIdToDelete(saiToDelete._id)}
                />
              </div>
              <WithProxyAccordions
                botType="customBotWithProxy"
                slackAppIntegrationId={slackAppIntegration._id}
                tokenGtoP={tokenGtoP}
                tokenPtoG={tokenPtoG}
                permissionsForBroadcastUseCommands={permissionsForBroadcastUseCommands}
                permissionsForSingleUseCommands={permissionsForSingleUseCommands}
                onUpdateTokens={onUpdateTokens}
                onSubmitForm={onSubmitForm}
              />
            </React.Fragment>
          );
        })}
        {slackAppIntegrations.length < 10 && (
          <div className="row justify-content-center my-5">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={addSlackAppIntegrationHandler}
            >
              {`+ ${t('admin:slack_integration.accordion.add_slack_workspace')}`}
            </button>
          </div>
        )}
      </div>
      <DeleteSlackBotSettingsModal
        isResetAll={false}
        isOpen={integrationIdToDelete != null}
        onClose={() => setIntegrationIdToDelete(null)}
        onClickDeleteButton={deleteSlackAppIntegrationHandler}
      />
    </>
  );
};

const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer]);

CustomBotWithProxySettings.defaultProps = {
  slackAppIntegrations: [],
};

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  slackAppIntegrations: PropTypes.array,
  proxyServerUri: PropTypes.string,
  onClickAddSlackWorkspaceBtn: PropTypes.func,
  onPrimaryUpdated: PropTypes.func,
  onDeleteSlackAppIntegration: PropTypes.func,
  onSubmitForm: PropTypes.func,
  connectionStatuses: PropTypes.object.isRequired,
  onUpdateTokens: PropTypes.func,
};

export default CustomBotWithProxySettingsWrapper;
