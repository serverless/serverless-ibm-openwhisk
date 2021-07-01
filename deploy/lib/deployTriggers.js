'use strict';

const BbPromise = require('bluebird');

module.exports = {
  deployTrigger(trigger) {
    return this.provider.client().then(ow => {
      if (this.options.verbose) {
        this.serverless.cli.log(`Deploying Trigger: ${trigger.triggerName}`);
      }

      return ow.triggers.create(trigger)
        .then(() => {
          if (this.options.verbose) {
            this.serverless.cli.log(`Deployed Trigger: ${trigger.triggerName}`);
          }
        }).catch(err => {
          throw new this.serverless.classes.Error(
            `Failed to deploy trigger (${trigger.triggerName}) due to error: ${err.message}`
          );
        });
    });
  },

  deployTriggers() {
    const triggers = this.getTriggers(this.serverless.service.triggers);

    if(triggers.length) {
      this.serverless.cli.log('Deploying Triggers...');
    }

    return BbPromise.all(
      triggers.map(t => this.deployTrigger(t))
    );
  },

  getTriggers(triggers) {
    return Object.keys(triggers)
      .map(t => {
        const trigger = triggers[t];
        if (trigger.feed) {
          Object.assign(trigger, {
            trigger: {
              annotations: [{
                key: 'feed',
                value: `/${trigger.feed.namespace}/${trigger.feed.feedName}`,
              }],
            },
          });
        }
        return trigger
      });
  },
};
