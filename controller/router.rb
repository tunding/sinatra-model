require 'sinatra/base'

class MyRouter < Sinatra::Base
    enable :sessions
	set :views, settings.root + '/../views'
	set :public_folder, File.dirname(__FILE__) + '/../public'


	get '/' do
		erb :index
	end

	get '/login' do
		erb :login
	end

	get '/logout' do
	    session[:useremail] = nil
		redirect "/"
	end
	
	post '/login' do
	    email    = params[:email]
	    password = params[:password]
	    session[:useremail] = email
	    user = User.create(:email => email, :password => password, :created_at => Time.now)
	    user.save
		redirect "/"
	end
	
	before do
	end
	
	after do
	end

	helpers do
	end

end
