<?php

namespace App\Http\Controllers;

class AuthenticateController extends Controller
{

    /*
     * User Creation
     */
    function user_registration(){

        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST ['password'];
        $firstName = $_POST['firstName'];
        $lastName = $_POST['lastName'];

        $credential = array(
            'username' => $username,
            'email'     => $email,
            'password'  => $password,
            'first_name' => $firstName,
            'last_name' => $lastName,
        );

        //Check If username is correctly set
        if((strlen($username) < 4) ||
            !preg_match('/^[a-zA-Z0-9]+[_.-]{0,1}[a-zA-Z0-9]+$/m', $username)){
            //TODO - IF Password is incorrectly set
            return "{'success' : false, 'error':{ 'code' : 'Aporia', 'message' : 'Username incorrectly set'}}";
        }

        //Check if username exists within DB
        $checkUserExist = \Sentinel::findByCredentials(['login' => $username]);
        if($checkUserExist){
            //TODO - The Email ALready Exists.
            return "{'success' : false, 'error':{ 'code' : 'Ares', 'message' : 'Username already exists'}}";
        }

        //Check If Password is correctly set
        if((strlen($password) < 8) ||
            !preg_match("#[0-9]+#", $password) ||
            !preg_match("#[a-zA-Z]+#", $password)){
            //TODO - IF Password is incorrectly set
            return "{'success' : false, 'error':{ 'code' : 'Aporia', 'message' : 'Password incorrectly set'}}";
        }

        //Check if email exists within DB
        $checkUserExist = \DB::table('users')->where('email',$email)->get();
        if($checkUserExist){
            //TODO - The Email ALready Exists.
            return "{'success' : false, 'error':{ 'code' : 'Aegaeon', 'message' : 'Email already exists'}}";
        }

        //Check If Email Has Correct Regex
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            //TODO - IF Email is not match proper email regex
            return "{'success' : false, 'error':{ 'code' : 'Aphrodite', 'message' : 'Email does not match regex'}}";
        }



        try{
            //Register User to Database
            \Sentinel::register($credential,true);

            //Check if User has been saved to DB
             $checkUserExist = \Sentinel::findByCredentials(['login' => $username]);
            if(!$checkUserExist){
                //TODO - Check if User has been saved into DB
                return "{'success' : false, 'error':{ 'code' : 'Artemis', 'message' : 'User unable to save to Database'}}";
            }


            if(!empty($email)){
                //Send Email to User saying they are registered
                \Mail::send('email',['email' => $email] , function($message) use($email){
                    $message->to($email)->subject('You have been registered, Welcome!');
                });
            }

            //Registration Successful - TODO - Go to Sucess page
            return \Response::json($checkUserExist->toArray());
        }catch(Exception $e){
            App::abort(404,$e->getMessage());
        }
    }

    /*
    *  Activation of user account
    */
    function user_activation(){
        $code = $_GET['a'];
        $userID = $_GET['id'];

        $user = \Sentinel::findById($userID);
        if(\Activation::complete($user,$code)){
            //TODO -
            //Activation was Succesfull
            return "{'success' : true}";
        }else{
            //TODO -
            //IT was no found/ Not complete
            return "{'success' : false, 'error':{ 'code' : 'Athena', 'message' : 'Activation not complete'}}";
        }
    }

    /*
    *   Authenticate the User when logging in
    */
    function user_authentication(){

        $username = $_POST['username'];
        $password = $_POST ['password'];

        $credential = array(
            'username'     => $username,
            'password'  => $password,
        );
        try{
            //Check if User Exists within Database
            if(!$user = \Sentinel::findByCredentials(['login' => $username])){
                //TODO - This User does not exist
                return "{'success' : false, 'error':{ 'code' : 'Aura', 'message' : 'User Does Not Exist'}}";
            }

            //Authenicate Users login and password
            if(!$user = \Sentinel::authenticateAndRemember($credential,true)){
                //TODO - What happens if login information is incorrect
                return "{'success' : false, 'error' : { 'code' : 'Adikia', 'message' : 'Login Information Incorrect'}}";
            }

            //generate login token
            $token = bcrypt($user);
            $user->api_token = $token;

            //save token to database
            \DB::table('users')->where('username',$username)->update(['api_token' => $token]);

            //Generate JSON to return
            return \Response::json(array('token' => $token, 'user' => $user->toArray()));
        }catch(\Cartalyst\Sentinel\Checkpoints\ThrottlingException $e){
            return "{'success' : false, 'error' : { 'code' : 'Acratopotes', 'message' : 'Too many login attempts'}}";
        }catch(\Cartalyst\Sentinel\Checkpoints\NotActivatedException $e){
            return "{'success' : false, 'error' : { 'code' : 'Adephagia', 'message' : 'Activation not complete'}}";
        }catch(Exception $e)
        {
            App::abort(404,$e->getMessage());
        }
    }
}
