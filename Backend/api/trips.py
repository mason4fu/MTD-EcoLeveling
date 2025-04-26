from flask import Blueprint, jsonify, request
from database.connection import get_db_connection
import requests
from dateutil import parser, tz

# Timezone for local conversion
tz_CT = tz.gettz('America/Chicago')

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

# ===================== Trip Planning =====================
@trips_bp.route('/get-trips', methods=['POST'])
def get_trips():
    data = request.json
    start_lat = data.get('start_lat')
    start_lon = data.get('start_lon')
    end_lat   = data.get('end_lat')
    end_lon   = data.get('end_lon')
    datetime_str = data.get('datetime')

    if not all([start_lat, start_lon, end_lat, end_lon, datetime_str]):
        return jsonify({"error": "Missing parameters"}), 400

    graphql_query = """
    query trip($from: Location!, $to: Location!, $dateTime: DateTime, $numTripPatterns: Int) {
      trip(
        from: $from,
        to: $to,
        dateTime: $dateTime,
        numTripPatterns: $numTripPatterns
      ) {
        tripPatterns {
          aimedStartTime
          aimedEndTime
          duration
          distance
          legs {
            mode
            aimedStartTime
            aimedEndTime
            distance
            duration
            fromPlace { name }
            toPlace { name }
            line { publicCode name }
            pointsOnLink { points }
          }
        }
      }
    }
    """

    variables = {
        "from": {"coordinates": {"latitude": start_lat, "longitude": start_lon}},
        "to":   {"coordinates": {"latitude": end_lat,   "longitude": end_lon}},
        "dateTime": datetime_str,
        "numTripPatterns": 5
    }

    try:
        resp = requests.post(
            "http://localhost:8080/otp/transmodel/v3",
            json={"query": graphql_query, "variables": variables},
            headers={"Content-Type": "application/json"}
        )
        resp.raise_for_status()
        patterns = resp.json().get("data", {}).get("trip", {}).get("tripPatterns", [])
        trips_data = patterns[1:] if len(patterns) > 1 else []

        if not trips_data:
            return jsonify({"message": "No trips found"}), 404

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Route_Short_Name, Route_Color FROM GTFS_Route")
        route_colors = {r: c for r, c in cursor.fetchall()}
        cursor.close()
        conn.close()

        for trip in trips_data:
            for leg in trip.get('legs', []):
                if leg.get('mode','').lower()=='bus':
                    code = leg.get('line',{}).get('publicCode')
                    leg['color'] = f"#{route_colors.get(code,'0000FF')}"
                else:
                    leg['color'] = 'black'

        valid = [t for t in trips_data if any(l.get('mode','').lower()=='bus' for l in t.get('legs', []))]
        if not valid:
            return jsonify({"message": "No valid bus trips found"}), 404
        return jsonify(valid)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===================== Trip Confirmation =====================
@trips_bp.route('/confirm-trip', methods=['POST'])
def confirm_trip():
    data = request.json
    user_id = data.get('user_id')
    trip    = data.get('trip')
    # parse origin/dest + datetime
    try:
        start_lat = float(data['start_lat'])
        start_lon = float(data['start_lon'])
        end_lat   = float(data['end_lat'])
        end_lon   = float(data['end_lon'])
        datetime_str = data['datetime']
    except Exception:
        return jsonify({"error": "Missing or invalid start/end coordinates or datetime"}), 400

    if not user_id or not trip:
        return jsonify({"error": "Missing user_id or trip"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        conn.start_transaction()

        bus_legs = [l for l in trip.get('legs', []) if l.get('mode','').lower()=='bus']
        total_dur  = sum(l.get('duration',0) for l in bus_legs)
        total_dist = sum(l.get('distance',0) for l in bus_legs)

        travel_date = trip['aimedStartTime'][:10]
        trip_id     = trip['aimedStartTime']
        cursor.execute(
            """
            INSERT INTO TravelHistory
              (User_ID, Trip_ID, Travel_Date, Total_Bus_Duration, Total_Bus_Distance, Created_At)
            VALUES (%s,%s,%s,%s,%s,NOW())
            """,(user_id,trip_id,travel_date,total_dur,total_dist)
        )
        history_id = cursor.lastrowid

        for leg in bus_legs:
            dt_start = parser.isoparse(leg['aimedStartTime'])
            dt_end   = parser.isoparse(leg['aimedEndTime'])
            local_start = dt_start.astimezone(tz_CT).replace(tzinfo=None)
            local_end   = dt_end.astimezone(tz_CT).replace(tzinfo=None)
            cursor.execute(
                """
                INSERT INTO BusLeg
                 (History_ID,Mode,StartTime,EndTime,Duration,Distance,
                  FromPlace,ToPlace,BusRoute,Polyline,Created_At)
                VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                """,
                (history_id,leg['mode'],local_start,local_end,
                 leg['duration'],leg['distance'],
                 leg['fromPlace']['name'],leg['toPlace']['name'],
                 leg.get('line',{}).get('publicCode',''),
                 leg.get('pointsOnLink',{}).get('points',''))
            )

        cursor.execute(
            """
            INSERT INTO TravelQueries
              (User_ID,History_ID,Start_Lat,Start_Lon,End_Lat,End_Lon,dateTime)
            VALUES(%s,%s,%s,%s,%s,%s,%s)
            """,
            (user_id,history_id,start_lat,start_lon,end_lat,end_lon,datetime_str)
        )
        conn.commit()
        return jsonify({"message":"Trip saved successfully!"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error":str(e)}),500
    finally:
        cursor.close()
        conn.close()

# ===================== Travel History Endpoints =====================
@trips_bp.route('/history',methods=['GET'])
def get_travel_history():
    uid = request.args.get('user_id',type=int)
    page= request.args.get('page',type=int,default=1)
    if not uid:
        return jsonify({"error":"Missing user_id"}),400
    conn=get_db_connection();cur=conn.cursor()
    try:
        lim,off=5,(page-1)*5
        cur.execute(
            """
            SELECT History_ID,Travel_Date,Trip_ID,Total_Bus_Duration,
                   Total_Bus_Distance,Notes,Trip_Rating
              FROM TravelHistory
             WHERE User_ID=%s
             ORDER BY Created_At DESC
             LIMIT %s OFFSET %s
            """,(uid,lim,off)
        )
        out=[]
        for r in cur.fetchall():
            out.append({
                "historyId":r[0],"travelDate":r[1].strftime("%Y-%m-%d"),
                "tripId":r[2],"duration":r[3],
                "distance":float(r[4]),"notes":r[5] or "",
                "rating":float(r[6]) if r[6]!=None else None
            })
        return jsonify(out)
    except Exception as e:
        return jsonify({"error":str(e)}),500
    finally:
        cur.close();conn.close()

@trips_bp.route('/history/<int:hid>/legs',methods=['GET'])
def get_trip_legs(hid):
    conn=get_db_connection();cur=conn.cursor()
    try:
        cur.execute(
            """
            SELECT bl.Leg_ID,bl.Mode,bl.StartTime,bl.EndTime,
                   bl.Duration,bl.Distance,bl.FromPlace,bl.ToPlace,bl.BusRoute,
                   (SELECT gr.Route_Long_Name FROM GTFS_Route gr
                    WHERE gr.Route_Short_Name=bl.BusRoute LIMIT 1)
            FROM BusLeg bl WHERE bl.History_ID=%s ORDER BY bl.StartTime ASC
            """,(hid,)
        )
        legs=[]
        for r in cur.fetchall():
            legs.append({
                "legId":r[0],"mode":r[1],
                "startTime":r[2].isoformat() if r[2] else None,
                "endTime":r[3].isoformat() if r[3] else None,
                "durationMinutes":round(r[4]/60,1) if r[4] else None,
                "distanceKm":float(r[5])/1000.0 if r[5] else None,
                "fromPlace":r[6] or "Unknown", "toPlace":r[7] or "Unknown",
                "busRouteName":r[9] or (r[8] or "Unknown")
            })
        return jsonify(legs)
    except Exception as e:
        return jsonify({"error":str(e)}),500
    finally:
        cur.close();conn.close()

@trips_bp.route('/history/<int:hid>',methods=['PATCH'])
def update_trip(hid):
    d=request.json;notes,rat=d.get('notes'),d.get('rating')
    if notes==None and rat==None:
        return jsonify({"error":"No updates provided"}),400
    conn=get_db_connection();cur=conn.cursor()
    try:
        f=[];v=[]
        if notes!=None: f.append("Notes=%s");v.append(notes)
        if rat  !=None: f.append("Trip_Rating=%s");v.append(rat)
        f.append("Updated_At=NOW()")
        sql=f"UPDATE TravelHistory SET {','.join(f)} WHERE History_ID=%s"
        v.append(hid);cur.execute(sql,tuple(v));conn.commit()
        return jsonify({"message":"Trip updated successfully"})
    except Exception as e:
        conn.rollback();return jsonify({"error":str(e)}),500
    finally:cur.close();conn.close()

@trips_bp.route('/history/<int:hid>',methods=['DELETE'])
def del_trip(hid):
    conn=get_db_connection();cur=conn.cursor()
    try:cur.execute("DELETE FROM TravelHistory WHERE History_ID=%s",(hid,));conn.commit();return jsonify({"message":"Deleted"})
    except Exception as e:conn.rollback();return jsonify({"error":str(e)}),500
    finally:cur.close();conn.close()
