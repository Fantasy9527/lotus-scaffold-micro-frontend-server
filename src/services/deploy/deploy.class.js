var shell = require('shelljs');

var fs = require('fs');
var os = require('os');
console.log(process.cwd() );
let projectPath = process.cwd();


let deployLine = [];
let deployTimer = null;
class Service {
  constructor(options) {
    this.options = options || {};
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

  deploy (data){
    console.log('webhook开始启动');
    let originPath = `${os.homedir()}/micro-frontend-temp`;
    let serviceStatic = `${os.homedir()}/micro-frontend-project/`;
    let path = `${os.homedir()}/micro-frontend-temp/${data.repository.name}`;
    //如果没有文件夹,直接 git clone
    if (!shell.test('-d', originPath)) {
      console.log('文件夹不存在,开始创建');
      shell.mkdir(originPath);
      shell.cd(originPath);
      console.log('开始clone项目', data.repository.name);
      shell.exec(`git clone ${data.repository.url}`);
    }

    shell.cd(path);
    console.log('检出分支为:', data.project.default_branch);
    shell.exec(`git checkout ${data.project.default_branch}`);

    console.log('准备拉取代码');
    shell.exec('git pull');

    console.log('开始安装依赖');
    shell.exec('cnpm i');

    console.log('开始构建打包');
    shell.exec('npm run build');
    console.log('打包完成,开始移动到服务静态目录');


    //判断是否有静态目录文件夹
    if (!shell.test('-d', serviceStatic)) {
      console.log('静态目录文件夹不存在,开始创建');
      shell.mkdir('-p', serviceStatic);
    }

    let projectPackage = require(`${path}/package.json`);
    let registerConfig = projectPackage.registerConfig;

    console.log();

    //删除旧文件夹
    let oldPath = `${serviceStatic}${data.repository.name}`;
    console.log('清除旧的目录文件', oldPath);
    shell.rm('-rf', oldPath);

    //移动打包好的文件
    let targetPath = `${serviceStatic}${data.repository.name}`;
    console.log('开始移动文件夹', `${path}/build to ${targetPath}`);
    shell.exec(`mv ${path}/build ${targetPath}`);
    console.log('移动完毕');
    fs.writeFileSync(`${targetPath}/project.js`, `module.exports=${JSON.stringify(registerConfig)}`, { encoding: 'utf-8' });
    
    let projectConfigList = [];
    //获取微前端配置文件的必要信息
    console.log('获取微前端配置文件的必要信息');
    generateProjectConfig(`${projectPath}/project`, projectConfigList);
    function generateProjectConfig(path, filesList) {
      var files = fs.readdirSync(path);
      files.forEach(function (itm, index) {
        var stat = fs.statSync(path +'/'+ itm);
        if (stat.isDirectory()) {
          //递归读取文件
          projectConfigList.push(require(path + '/' + itm + '/project.js'));
        } 
      });
    }

    console.log(projectConfigList);

    //生成微前端配置文件
    console.log('生成微前端配置文件');
    fs.writeFileSync(`${projectPath}/view/project.js`, `module.exports={projects:${JSON.stringify(projectConfigList)}}`, { encoding: 'utf-8' });

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
