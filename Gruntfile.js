
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

        watch: {

          stylesheets: {
            files: ['public/stylesheets/blog.css',
            'public/stylesheets/explore.css',
            'public/stylesheets/build.css'],
            tasks: ['cssmin']
          },

          scripts: {
            files: ['public/javascripts/graphhandler.js',
            'public/javascripts/rendergraph.js',
            'public/javascripts/article_searcher.js',
            'public/javascripts/note.js'],
            tasks: ['uglify']
          }
        },
		jshint: {
	      options: {
	        reporter: require('jshint-stylish') 	      },
	
	      build: ['public/javascripts/graphhandler.js', 'public/javascripts/explorehandler.js', 'app.js', 'public/javascripts/blogparser.js','public/javascripts/bloghandler.js']
	    },

	    uglify: {
	      options: {
	        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
	      },
	      build: {
	        files: {
	          'public/build/js/graphhandler.min.js': 'public/javascripts/graphhandler.js',
	          'public/build/js/rendergraph.min.js': 'public/javascripts/rendergraph.js',
	          'public/build/js/article_searcher.min.js': 'public/javascripts/article_searcher.js',
	          'public/build/js/note.min.js': 'public/javascripts/note.js'
	          
	        }
	      }
	    },

	    cssmin: {
	      options: {
	        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
	      },
	      build: {
	        files: {
	          'public/build/css/blog.min.css': 'public/stylesheets/blog.css',
	          'public/build/css/explore.min.css': 'public/stylesheets/explore.css',
	          'public/build/css/build.min.css': 'public/stylesheets/build.css'
	        }
	      }
	    },
	    
	    imagemin: {
	        png: {
	          options: {
	            optimizationLevel: 7,
	            pngquant: true
	          },
	          files: [
	            {
	              // Set to true to enable the following options…
	              expand: true,
	              // cwd is 'current working directory'
	              cwd: 'public/img/',
	              src: ['**/*.png'],
	              // Could also match cwd line above. i.e. project-directory/img/
	              dest: 'public/build/img/',
	              ext: '.png'
	            }
	          ]
	        },
	        jpg: {
	          options: {
	            progressive: true
	          },
	          files: [
	            {
	              // Set to true to enable the following options…
	              expand: true,
	              // cwd is 'current working directory'
	              cwd: 'public/img/',
	              src: ['**/*.jpg'],
	              // Could also match cwd. i.e. project-directory/img/
	              dest: 'public/build/img/',
	              ext: '.jpg'
	            }
	          ]
	        }
	      }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  grunt.registerTask('default', ['uglify', 'cssmin','jshint']);
  grunt.registerTask('image', ['imagemin']);
  
  

};