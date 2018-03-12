var shell = require('shelljs');

var fs = require('fs'); 

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    return 222;
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    console.log('触发了', data);
    let originPath = '~/micro-frontend-temp';
    let path = `~/micro-frontend-temp/${data.repository.name}`;
    if (!shell.test('-d', path)) {
      console.log('文件夹不存在,开始创建');
      // shell.mkdir('-p', path);
      shell.cd(originPath);
      shell.exec(`git clone ${data.repository.url}`);
    }

    shell.cd(path);
    shell.exec(`git checkout ${data.project.default_branch}`);
    shell.exec('git pull');
    shell.exec('cnpm i');
    shell.exec('npm run build');
    console.log('打包完成');
    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
