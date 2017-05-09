module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Before generating any new files, remove any previously-created files.
    clean: {
      build: ['build', 'src/packages', 'src/dist', 'src/node_modules']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/nomic.js', 'src/version.json']
    },
    version: {
      nomic: {
        src: ['package.json', 'src/package.json', 'src/version.json']
      }
    },
    exec: {
      install_dependencies: {
        cmd: 'cd ./src && npm install --save'
      },
      run_tests: {
        cmd: 'npm run exec-test'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', ['exec', 'jshint']);
  grunt.registerTask('default', ['clean', 'exec', 'jshint']);
};
