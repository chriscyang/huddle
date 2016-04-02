<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

use App\Http\Requests\EventRequest;
use App\Models\Conference;
use App\Models\Event;
use App\Models\User;

class EventController extends Controller
{
    /**
     * Retrieve all Events for a Conference.
     *
     * @return Collection|Response
     */
    public function index(Request $request, $cid)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference) {
                return response()->error(404, 'Conference Not Found');
            }

            // Retrieve its Events.
            return $conference->events()->get();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Create an Event for a Conference.
     *
     * @return Response
     */
    public function store(EventRequest $request, $cid)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference->exists()) {
                return response()->error(404, 'Conference Not Found');
            }

            // Check if the User is managing the Conference.
            if (!$this->isConferenceManager($request, $cid)) {
                return response()->error(403);
            }

            // Create the Event.
            $event = new Event($request->all());
            $event->conference()->associate($conference);
            $event->save();
            $event->managers()->attach($request->header('ID'));

            $this->addActivity($request->header('ID'),'request', $event->id, 'event');

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Retrieve an Event.
     *
     * @return Model|Response
     */
    public function show(EventRequest $request, $cid, $eid)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference) {
                return response()->error(404, 'Conference Not Found');
            }

            // Check if the Event exists.
            $event = Event::find($eid);
            if (!$event) {
                return response()->error(404, 'Event Not Found');
            }

            // Retrieve the Event.
            return $event;
        } catch (Exception $e) {
            return response()->error();
        }
    }


    /**
     * Update an Event.
     *
     * @param  EventRequest  $request
     * @param  int  $conferences
     * @param  int  $eid
     * @return Response
     */
    public function update(EventRequest $request, $cid, $eid)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference) {
                return response()->error(404, 'Conference Not Found');
            }

            // Check if the Event exists.
            $event = Event::find($eid);
            if (!$event) {
                return response()->error(404, 'Event Not Found');
            }

            if (!$this->isEventManager($request, $eid)) {
                return response()->error(403, 'You are not a manager of this event.');
            }

            if (($request->status == 'approved' || $request->status == 'denied')) {
                $event->update($request->all());
                $this->addActivity($request->header('ID'),$request->status, $eid, 'event');
                $this->sendCreationEmail('event', $event->id, $request->status);
            } elseif(($request->status != 'approved' && $request->status != 'denied')) {
                $event->fill($request->all())->save();
                 $this->addActivity($request->header('ID'),'update', $eid, 'event');
            } else {
                return response()->error(403);
            }

            $event->fill($request->all())->save();

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    /**
     * Delete an Event.
     *
     * @param  EventRequest  $request
     * @param  int  $conferences
     * @param  int  $id
     * @return Response
     */
    public function destroy(EventRequest $request, $cid, $eid)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference) {
                return response()->error(404, 'Conference Not Found');
            }

            // Check if the Event exists.
            $event = Event::find($eid);
            if (!$event) {
                return response()->error(404, 'Event Not Found');
            }

            if (!$this->isEventManager($request, $eid)) {
                return response()->error(403, 'You are not a manager of this event.');
            }

            $event->delete();

            //Add Activity to log
            $this->addActivity($request->header('ID'),'delete', $eid, 'event');

            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function indexWithStatus(Request $request)
    {
        try {
            return Event::where('status', $request->status)->get();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function updateWithStatus(EventRequest $request, $id)
    {
        try {
            $event = Event::find($id);
            if (!$event) {
                return response()->error("Event not found");
            }

            $conf = Conference::find($request->conference_id);
            if (!$conf) {
                return response()->error(404);
            }

            //Check if event manager belongs to this event OR admin
            $userId = $request->header('ID');
            if (!$event->managers()->where('user_id', $userID)->get()||
                !$conf->managers()->where('user_id',$userID)->get() ||
                (Sentinel::findById($userId)->roles()->first()->name !='System Administrator') ||
                !User::find($userId)->hasAccess(['event.update'])) {
                return response()->error("403" , "Permission Denied");
            }

            $event->update([
                'status' => $request->status,
            ]);

            //Add Activity to log
            $this->addActivity($request->header('ID'),$request->status, $event->id, 'event');

            //Send Status update Email
            $this->sendCreationEmail('event', $id, $request->status);
            return response()->success();
        } catch (Exception $e) {
            return response()->error();
        }
    }

    public function conferenceIndexWithStatus(Request $request, $cid, $status)
    {
        try {

            // Check if the Conference exists.
            $conference = Conference::find($cid);
            if (!$conference) {
                return response()->error(404, 'Conference Not Found');
            }

            // Retrieve its Events.
            return $conference->events()->where('status', $status)->get();
        } catch (Exception $e) {
            return response()->error();
        }
    }
}
