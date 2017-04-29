Generate My Project

通过模板文件生成项目文件的工具


安装说明：
  安装nodejs，添加nodejs所在目录到PATH环境变量
  添加gmp所在目录到PATH环境变量


使用说明：
  gmp <template>
    template参数可以是模板文件所在目录，例如：gmp ../MyTemplates/vs2010
    或者gmp/template下的目录， 例如：gmp vs2015
  

gmp生成项目文件流程:
  1. 如果当前目录下存在BUILD.gmp，则加载该文件中的参数，否则使用默认的参数
  2. 将模板目录拷贝到当前目录
  3. 替换拷贝后的文件内容，文件里的所有##{javascript code}##，
     会替换成运行该javascript code得到的值
  

gmp替换规则：
  例如BUILD.gmp内容为 {"foo":"bar"}，
  那么模板文件中所有的##{gmp.foo}##，就会被替换成bar。

  也可以通过追加到"out"变量来得到结果，
  如 ##{ out+="hello_"; out+=gmp.foo; }##，会替换成hello_bar

  可以按照这个规则，定义BUILD.gmp里所需的参数，创建自己的项目的模板文件。


gmp预置参数：
  target    字符串 目标项目名称，默认取当前目录名
  srcdirs   数组   源码文件目录，用于遍历这些目录（包含子目录）得到源码文件列表
  srcs      数组   源码文件列表
  headers   数组   头文件列表
  srcext    字符串 源码文件扩展名，例如".c .cpp .cc"
  headerext 字符串 头文件扩展名，例如".h .hpp"
  exludes   数组   文件名中包含该列表中的任意字符串，则从源码文件列表中排除

