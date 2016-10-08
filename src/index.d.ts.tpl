{%
    function read(filename) {
        return o.compilation.assets[filename].source().replace(/^import .*$/gm, '');
    }
%}{%#
    read('SubClass.d.ts')
%}{%#
    read('TestClass.d.ts')
%}
export as namespace {%# o.compiler.options.output.library %};
