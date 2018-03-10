'use strict';
module.exports = function(shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-cnpmjs')(shipit);
  require('shipit-pm2')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      repositoryUrl: 'http://git.jc/yangfan01/micro-frontend-server.git',
      ignores: [
        '.git', 'node_modules',
      ],
      keepReleases: 1,
      deleteOnRollback: false,
      shallowClone: true,
      cnpm: {},
    },
    // Production: {
    //   env: 'prod',
    //   pm2: {
    //     json: '/root/micro-frontend/current/pm2.json',
    //   },
    //   deployTo: '/root/micro-frontend/',

    //   servers: [ 'root@10.0.26.105' ],
    //   branch: '1.5.3',
    // },
    Development: {
      env: 'dev',
      isDevelopment: true,
      pm2: {
        json: '/root/micro-frontend-server/current/pm2.test.json',
      },
      deployTo: '/root/micro-frontend-server/',
      servers: [ 'root@10.0.21.105' ],
      branch: 'master',
    },
    // Test: {
    //   env: 'test',
    //   isDevelopment: true,
    //   pm2: {
    //     json: '/root/micro-frontend-server/current/pm2.test.json',

    //   },
    //   deployTo: '/root/micro-frontend-server/',
    //   servers: [ 'root@10.0.21.160' ],
    //   branch: 'master',

    // },
  });

  var bootstrap = function() {
    // const baseDir = '/root/micro-frontend-server/current';
    // shipit.remote(`mkdir ${baseDir}/public;`);

    // shipit.remote(`ln -nfs /root/project/view-pool ${baseDir}/app/view`);
    // shipit.remote(`ln -nfs /root/project/Attachments ${baseDir}/app/static/Attachments`);
    // shipit.remote(`cd ${baseDir}; npm stop`);
    // setTimeout(function() {
    //   switch (shipit.config.env) {
    //     case 'dev':
    //       shipit.remote(`cd ${baseDir}; npm run start:dev`);
    //       break;
    //     case 'test':
    //       shipit.remote(`cd ${baseDir}; npm run start:test`);
    //       break;
    //     case 'prod':
    //       shipit.remote(`cd ${baseDir}; npm run start`);
    //       break;
    //     default:
    //       shipit.remote(`cd ${baseDir}; npm run start:dev`);
    //       break;
    //   }
    // }, 10000);

  };

  shipit.on('deployed', bootstrap);

  if (shipit.config.isDevelopment) {
    // 开发环境
    // 发布完成之后建立视图的链接
    shipit.on('rollbacked', () => {
      bootstrap();
    });

  } else {
    // 生产环境
    // 发布完成之后建立视图的链接
    shipit.on('rollbacked', () => {
      bootstrap();
    });
  }
};
