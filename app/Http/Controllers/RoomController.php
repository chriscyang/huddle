<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

use App\Http\Requests\RoomRequest;

use App\Models\Accommodation;
use App\Models\Room;

class RoomController extends Controller
{
    /**
     * Retrieve all Rooms of an Accommodation.
     *
     * @param  Request  $request
     * @param  int  $aid
     * @return Collection|Response
     */
    public function index(Request $request, $aid)
    {
        try {
            // TODO: Check manager status

            $accommodation = Accommodation::find($aid);
            if (!$accommodation) {
                return response()->error(404, 'Accommodation Not Found');
            }

            return $accommodation->rooms()->get();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Create a Room for an Accommodation.
     *
     * @param  RoomRequest  $request
     * @param  int  $aid
     * @return Response
     */
    public function store(RoomRequest $request, $aid)
    {
        try {
            // TODO: Check manager status

            $accommodation = Accommodation::find($aid);
            if (!$accommodation) {
                return response()->error(404, 'Accommodation Not Found');
            }

            $room = new Room($request->all());
            $room->accommodation()->associate($accommodation);
            $room->save();

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Update a Room of an Accommodation.
     *
     * @param  RoomRequest  $request
     * @param  int  $aid
     * @param  int  $rid
     * @return Response
     */
    public function update(RoomRequest $request, $aid, $rid)
    {
        try {
            // TODO: Check manager status.

            $accommodation = Accommodation::find($aid);
            if (!$accommodation) {
                return response()->error(404, 'Accommodation Not Found');
            }

            $room = Room::find($rid);
            if (!$room) {
                return response()->error(404, 'Room Not Found');
            }

            $room->fill($request->all())->save();

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Delete a Room of an Accommodation.
     *
     * @param  RoomRequest  $request
     * @param  int  $aid
     * @param  int  $rid
     * @return Response
     */
    public function destroy(RoomRequest $request, $aid, $rid)
    {
        try {
            // TODO: Check manager status.

            $accommodation = Accommodation::find($aid);
            if (!$accommodation) {
                return response()->error(404, 'Accommodation Not Found');
            }

            $room = Room::find($rid);
            if (!$room) {
                return response()->error(404, 'Room Not Found');
            }

            // TODO: Check existence of guests.

            $room->delete();

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }
}
