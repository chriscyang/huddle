<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

use App\Http\Requests\ProfileRequest;
use App\Models\Profile;

class ProfileController extends Controller
{
    public function index($user)
    {
        try {
            return Profile::where('user_id', $user)->first();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function store(ProfileRequest $request)
    {
        try {
            Profile::create($request->all());
            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function show($id)
    {
        try {
            return Profile::findOrFail($id);
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function update(ProfileRequest $request, $id)
    {
        try {
            Profile::findOrFail($id)->update($request->all());
            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function destroy($id)
    {
        try {
            $profile = Profile::findOrFail($id);
            if ($profile->is_owner == 1) {
                return response()->error();
            }
            $profile->delete();
            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }
}
