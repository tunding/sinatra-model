# encoding:UTF-8
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/development.db")

class User
  include DataMapper::Resource
  
  property :id, Serial
  property :email, String, :required=>true
  property :password, String, :required=>true
  property :created_at, DateTime

end

DataMapper.finalize
DataMapper.auto_upgrade!