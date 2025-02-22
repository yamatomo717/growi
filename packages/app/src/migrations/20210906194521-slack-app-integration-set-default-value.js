import mongoose from 'mongoose';

import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';
import { getModelSafely } from '~/server/util/mongoose-utils';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:slack-app-integration-set-default-value');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    // Add columns + set all default commands if supportedCommandsForBroadcastUse column does not exist
    const SlackAppIntegration = getModelSafely('SlackAppIntegration') || require('~/server/models/slack-app-integration')();

    // Add togetter command if supportedCommandsForBroadcastUse already exists
    const slackAppIntegrations = await SlackAppIntegration.find();
    slackAppIntegrations.forEach(async(doc) => {
      if (!doc.supportedCommandsForSingleUse.includes('togetter')) {
        doc.supportedCommandsForSingleUse.push('togetter');
      }
      await doc.save();
    });

    logger.info('Migration has successfully applied');
  },

  async down() {
    // no rollback
  },
};
