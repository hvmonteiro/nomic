module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Before generating any new files, remove any previously-created files.
    clean: {
      build: ['build', 'src/packages', 'src/dist', 'src/node_modules']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/nomic.js', 'src/version.json', 'examples/*.js']
    },
    version: {
      nomic: {
        src: ['package.json', 'src/package.json', 'src/version.json']
      }
    },
    exec: {
      install_dependencies: {
        cmd: 'cd ./src && npm install --save --quiet ; cd ..'
      },
      run_tests: {
        cmd: 'npm run exec-test ; echo Tested'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', ['jshint', 'exec']);
  grunt.registerTask('default', ['jshint', 'clean', 'exec']);
};
