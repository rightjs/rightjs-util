#
# RightJS Building Utils
#
# Copyright (C) 2010 Nikolay Nemshilov
#
class RUtil
  
  COMPILER_CMD = "java -jar #{File.dirname(__FILE__)}/compiler.jar --js=%{original} >> %{compressed}"
  JSCHECKS_CMD = "java -jar #{File.dirname(__FILE__)}/rhino.jar %{lintfile}"
  
  COMPILER_URL = 'http://closure-compiler.appspot.com/compile'
  
  #
  # Basic constructor
  #
  # @param String the header filename
  # @param String the layout filename
  # @param Hash various placeholders to fill
  #
  def initialize(header, layout=nil, holders={})
    @header  = File.read(header)
    @layout  = File.read(layout) if layout
    @holders = holders
  end
  
  #
  # Packs the source code out of the list of files
  #
  # @param Array list of file names
  #
  def pack(list_of_files)
    @source = list_of_files.collect do |filename|
      File.read(filename)
    end.join("\n\n")
    
    # prepatching the source code if there is a block
    @source = yield(@source) if block_given?
    
    # packing everything in the layout
    if @layout
      layout = @layout.split('%{source_code}')
      @source = layout[0] + @source + layout[1]
    end
    
    # processing the placeholders
    @holders.each do |key, value|
      @source.gsub! "%{#{key}}", value.to_s
    end
  end
  
  #
  # Paatches the sourcecode
  #
  # @param Block to process the source code
  #
  def patch(&block)
    @source = yield(@source)
  end
  
  #
  # Writes the source file down
  #
  # @param String file name
  #
  def write(filename)
    @filename     = filename
    @src_filename = @filename.include?('-server') ?
      @filename : @filename.gsub('.js', '-src.js')
    
    File.open(@src_filename, 'w') do |f|
      f.write @header
      f.write @source
    end
  end
  
  #
  # Runs the jslint check
  #
  # @param String the lint-file name
  #
  def check(lintfile)
    system JSCHECKS_CMD.gsub('%{lintfile}', lintfile)
  end
  
  #
  # Compiles the source code
  #
  def compile(remote=nil)
    remote = ENV['REMOTE'] == 'true' if remote.nil?
    remote ? compile_remotely : compile_locally
    
    # creating the gziped version of the script
    # so we could estimate the size
    system "gzip -c #{@filename} > #{@filename}.gz"
  end
  
private
  
  # compiles the source using the local jar
  def compile_locally
    # writting down the file header
    File.open(@filename, "w") do |f|
      f.write @header
    end
    
    system(COMPILER_CMD.gsub(
      '%{original}',   @src_filename).gsub(
      '%{compressed}', @filename
    ))
  end
  
  # compiles the source using the google's RESTful API
  def compile_remotely
    require 'net/http'
    require 'uri'
    
    # removing the comments to make it smaller
    # otherwise google will complain about the size
    source = File.read(@src_filename)
    source.gsub!(/\n *\/\*.*?\*\//im, '')
    source.gsub!(/\/\/.*?($)/, '\1')
    source.gsub!(/\n[ \t]*(\n)/, "\n")
    
    res = Net::HTTP.post_form(URI.parse(COMPILER_URL), {
      :js_code           => source,
      :compilation_level => 'SIMPLE_OPTIMIZATIONS',
      :output_format     => 'text',
      :output_info       => 'compiled_code',
      :warning_level     => 'QUIET'
    })
    
    File.open(@filename, "w") do |f|
      f.write @header
      f.write res.body
    end
  end
end