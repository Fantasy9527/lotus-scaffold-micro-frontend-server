var shell = require('shelljs');

var fs = require('fs');  
const fse = require('fs-extra');
var os = require('os');
console.log(process.cwd() );
let projectPath = process.cwd();

//项目初始化的时候链接文件夹
shell.exec(`ln -nfs ${os.homedir()}/micro-frontend-project ${projectPath}/project`);
shell.exec(`ln -nfs ${os.homedir()}/micro-frontend-view ${projectPath}/view`);


let deployLine = [];
let deployTimer = null;
class Service {
  constructor(options) {
    this.options = options || {};
    let projectConfigList = this.generateProjectConfig(`${projectPath}/project`, []);
    //生成微前端配置文件
    console.log('生成微前端配置文件');
    fs.writeFileSync(`${projectPath}/view/project.js`, `module.exports={projects:${JSON.stringify(projectConfigList)}}`, { encoding: 'utf-8' });
  }

  async find(params) {
    return 222;
  }

  async get(id, params) {
    return {
      id,
      text: `A new message with ID: ${id}!`
    };
  }

  async create(data, params) {
    deployLine.push(data);
    deployTimer&&clearTimeout(deployTimer);
    deployTimer = setTimeout(()=>{
      this.deploy(deployLine[deployLine.length-1]);
      deployTimer = null;
    },5000);

    return data;
  }

  async deploy (data){
    console.log('webhook开始启动');
    console.log(data);
    let originPath = `${os.homedir()}/micro-frontend-temp`;
    let serviceStatic = `${os.homedir()}/micro-frontend-project/`;
    let viewStatic = `${os.homedir()}/micro-frontend-view/`;
    let path = `${os.homedir()}/micro-frontend-temp/${data.repository.name}`;
    //如果没有文件夹,直接 git clone
    console.log(this.fsExistsSync(originPath));
    if (!this.fsExistsSync(originPath)) {
      console.log('文件夹不存在,开始创建');
      shell.mkdir(originPath);
    }
    shell.cd(originPath);
    console.log('开始clone项目', data.repository.name, data.repository);
    shell.exec(`git clone ${data.repository.url}`);

    shell.cd(path);
    console.log('当前目录为:');
    shell.exec('pwd');
    console.log('检出分支为:', data.project.default_branch);
    shell.exec(`git checkout ${data.project.default_branch}`);

    console.log('准备拉取代码');
    shell.exec('git pull');

    console.log('开始安装依赖');
    shell.exec('cnpm i');

    console.log('开始构建打包');
    shell.exec('npm run build:micro');
    console.log('当前项目为:', data.repository);
    console.log('打包完成,开始移动到服务静态目录');

    //判断是否有静态目录文件夹
    if (!shell.test('-d', serviceStatic)) {
      console.log('静态目录文件夹不存在,开始创建');
      shell.mkdir('-p', serviceStatic);
    }

    //判断是否有静态目录文件夹
    if (!this.fsExistsSync(viewStatic)) {
      console.log('静态目录文件夹不存在,开始创建');
      shell.mkdir('-p', viewStatic);
    }

    let projectPackage = require(`${path}/package.json`);
    let registerConfig = projectPackage.registerConfig;

    //移动打包好的文件
    //如果是 micro-frontend-portal
    let targetPath;
    console.log(registerConfig);


    //如果是出口项目,则直接移动到 view目录
    console.log('当前项目为:',data.repository.name);
    if (data.repository.name === 'frontend-portal') {
      targetPath = `${viewStatic}`;
    }else{
      targetPath = `${serviceStatic}${registerConfig.name}`;
    }
 
    console.log('开始移动文件夹', `${path}/build to ${targetPath}`);
    
    try {
      await fse.copy(`${path}/build`, `${targetPath}`);
      console.log('移动完毕');
    } catch (err) {
      console.error(err);
    }
    

    //不是出口项目,才写入配置文件
    console.log("是否为出口项目"，data.repository.name !== 'frontend-portal')
    if (data.repository.name !== 'frontend-portal') {
      fs.writeFileSync(`${targetPath}/project.js`, `module.exports=${JSON.stringify(registerConfig)}`, { encoding: 'utf-8' });
    }
   
    
    //获取微前端配置文件的必要信息
    console.log('获取微前端配置文件的必要信息');
    let projectConfigList =  this.generateProjectConfig(`${projectPath}/project`, []);

    console.log(projectConfigList);

    //生成微前端配置文件
    console.log('生成微前端配置文件');
    fs.writeFileSync(`${projectPath}/view/project.js`, `module.exports={projects:${JSON.stringify(projectConfigList)}}`, { encoding: 'utf-8' });

    //删除旧文件夹
    try {
      let oldPath = `${serviceStatic}${data.repository.name}`;
      console.log('清除旧的目录文件', oldPath);
      await fse.remove('oldPath');
      console.log('清除旧的目录文件 成功!');
    } catch (err) {
      console.error(err);
    }

    console.log('发布完毕!!!!!!!');


  }


  generateProjectConfig(path, projectConfigList) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
      var stat = fs.statSync(path + '/' + itm);
      if (stat.isDirectory()) {
      //递归读取文件
        projectConfigList.push(require(path + '/' + itm + '/project.js'));
      }
    });
    return projectConfigList;
  }

  fsExistsSync(path) {
    try {
      fs.accessSync(path, fs.F_OK);
    } catch (e) {
      return false;
    }
    return true;
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return {
      id
    };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;



// let demo = {
//   project: {
//     name: 'micro-react-scaffold',
//     description: '',
//     web_url: 'http://git.jc/yangfan01/micro-react-scaffold',
//     avatar_url: null,
//     git_ssh_url: 'ssh://git@git.jc:2222/yangfan01/micro-react-scaffold.git',
//     git_http_url: 'http://git.jc/yangfan01/micro-react-scaffold.git',
//     namespace: 'yangfan01',
//     visibility_level: 0,
//     path_with_namespace: 'yangfan01/micro-react-scaffold',
//     default_branch: 'master',
//     homepage: 'http://git.jc/yangfan01/micro-react-scaffold',
//     url: 'ssh://git@git.jc:2222/yangfan01/micro-react-scaffold.git',
//     ssh_url: 'ssh://git@git.jc:2222/yangfan01/micro-react-scaffold.git',
//     http_url: 'http://git.jc/yangfan01/micro-react-scaffold.git'
//   },
//   commits: [{
//     id: 'e910bfcf734a3e0ded262d939fd1c7a06c96284c',
//     message: 'test\n',
//     timestamp: '2018-03-12T12:21:04+08:00',
//     url: 'http://git.jc/yangfan01/micro-react-scaffold/commit/e910bfcf734a3e0ded262d939fd1c7a06c96284c',
//     author: [Object],
//     added: [],
//     modified: [Array],
//     removed: []
//   }],
//   total_commits_count: 1,
//   repository: {
//     name: 'micro-react-scaffold',
//     url: 'ssh://git@git.jc:2222/yangfan01/micro-react-scaffold.git',
//     description: '',
//     homepage: 'http://git.jc/yangfan01/micro-react-scaffold',
//     git_http_url: 'http://git.jc/yangfan01/micro-react-scaffold.git',
//     git_ssh_url: 'ssh://git@git.jc:2222/yangfan01/micro-react-scaffold.git',
//     visibility_level: 0
//   }
// }
// }
