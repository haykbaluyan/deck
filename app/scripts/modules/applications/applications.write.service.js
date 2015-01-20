'use strict';

angular
  .module('deckApp.applications.write.service', [
    'deckApp.taskExecutor.service'
  ])
  .factory('applicationWriter', function($q, taskExecutor) {

    function createApplication(app) {
      return taskExecutor.executeTask({
        suppressNotification: true,
        job: [
          {
            type: 'createApplication',
            account: app.account,
            application: {
              name: app.name,
              description: app.description,
              email: app.email,
              owner: app.owner,
              type: app.type,
              group: app.group,
              monitorBucketType: app.monitorBucketType,
              pdApiKey: app.pdApiKey,
              updateTs: app.updateTs,
              createTs: app.createTs,
              tags: app.tags
            }
          }
        ],
        application: app,
        description: 'Create Application: ' + app.name
      });
    }

    function updateApplication (app) {
      var taskList = [];
      var accounts = app.accounts.split(',');

      accounts.forEach(function(account) {
        taskList.push(taskExecutor.executeTask({
          suppressNotification: true,
          job: [
            {
              type: 'updateApplication',
              account: account,
              application: {
                name: app.name,
                description: app.description,
                email: app.email,
                owner: app.owner,
                type: app.type,
                group: app.group,
                monitorBucketType: app.monitorBucketType,
                pdApiKey: app.pdApiKey,
                updateTs: app.updateTs,
                createTs: app.createTs,
                tags: app.tags
              }
            }
          ],
          application: app,
          description: 'Updating Application: ' + app.name
        }));
      });

      return $q.all(taskList);

    }


    function deleteApplication(app) {
      var taskList = [];
      var accounts = app.accounts && app.accounts.length ? app.accounts.split(',') : [];

      accounts.forEach(function(account) {
        taskList.push(taskExecutor.executeTask({
          suppressNotification: true,
          job: [
            {
              type: 'deleteApplication',
              account: account,
              application: {
                name: app.name,
              }
            }
          ],
          application: app,
          description: 'Deleting Application: ' + app.name
        }));
      });

      return $q.all(taskList).then(
        handleSuccessfulTaskComplete,
        handleTaskFailure
      );

    }

    /**
     * Handles the success of all the posted tasks
     * @param taskResponseList
     * @returns $q.promise
     */
    function handleSuccessfulTaskComplete(taskResponseList) {
      return _.first(taskResponseList).watchForTaskComplete();
    }


    /**
     * Handles the failure for all the posted task, and pass it up to handle in the controller code.
     * @param errors
     */
    function handleTaskFailure(error) {
      throw error;
    }

    return {
      createApplication: createApplication,
      updateApplication: updateApplication,
      deleteApplication: deleteApplication
    };

  });
