Generator My Project

tool for generator project from template files.


install:
  add directory of nodejs to PATH environment.
  add directory of gmp to PATH environment.


usage: 
  gmp <template>
    template can be a directory name contains template files,
    or directory name in gmp/template. example: gmp vs2015.
  

how does gmp works:
1. load properties from "BUILD.gmp" file if exist.
2. copy template directory to current dir.
3. replace content of template files, ##{ javascript code }## by eval(javascript code).


















