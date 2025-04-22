from flask import Blueprint, jsonify, request
from database.connection import get_db_connection
import requests

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('/get-trips', methods=['POST'])
def get_trips():
    data = request.json
    start_lat = data.get('start_lat')
    start_lon = data.get('start_lon')
    end_lat = data.get('end_lat')
    end_lon = data.get('end_lon')
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
        "to": {"coordinates": {"latitude": end_lat, "longitude": end_lon}},
        "dateTime": datetime_str,
        "numTripPatterns": 5
    }

    try:
        response = requests.post(
            "http://localhost:8080/otp/transmodel/v3",
            json={"query": graphql_query, "variables": variables},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        trips_data = response.json().get("data", {}).get("trip", {}).get("tripPatterns", [])

        # Ignore the first trip pattern
        if len(trips_data) > 1:
            trips_data = trips_data[1:]
        else:
            trips_data = []

        if not trips_data:
            return jsonify({"message": "No trips found"}), 404

        #Load Route Colors
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT Route_Short_Name, Route_Color FROM GTFS_Route")
        route_color_map = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.close()
        conn.close()

        #Assign Colors to each leg
        for trip in trips_data:
            for leg in trip.get('legs', []):
                if leg.get('mode', '').lower() == 'bus':
                    route_short_name = leg.get('line', {}).get('publicCode')
                    if route_short_name and route_short_name in route_color_map:
                        leg['color'] = f"#{route_color_map[route_short_name]}"
                    else:
                        leg['color'] = 'blue'
                else:
                    leg['color'] = 'black'

        #Validate trips have bus legs
        valid_trips = []
        for trip in trips_data:
            has_bus = any(leg.get('mode', '').lower() == 'bus' for leg in trip.get('legs', []))
            if has_bus:
                valid_trips.append(trip)

        if not valid_trips:
            return jsonify({"message": "No valid bus trips found"}), 404

        return jsonify(valid_trips)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@trips_bp.route('/confirm-trip', methods=['POST'])
def confirm_trip():
    data = request.json
    user_id = data.get('user_id')
    trip = data.get('trip')

    if not user_id or not trip:
        return jsonify({"error": "Missing user_id or trip"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert into TravelHistory
    travel_date = trip['aimedStartTime'][:10]   # YYYY-MM-DD for Travel_Date
    trip_id = trip['aimedStartTime']             # Full ISO datetime string for Trip_ID

    cursor.execute("""
        INSERT INTO TravelHistory (User_ID, Trip_ID, Travel_Date, Total_Bus_Duration, Total_Bus_Distance, Created_At)
        VALUES (%s, %s, %s, %s, %s, NOW())
    """, (
        user_id,
        trip_id,
        travel_date,
        trip['duration'],
        trip['distance']
    ))
    history_id = cursor.lastrowid

    # Insert each BusLeg (only bus legs)
    for leg in trip.get('legs', []):
        if leg['mode'].lower() != 'bus':
            continue
        cursor.execute("""
            INSERT INTO BusLeg (History_ID, Mode, StartTime, EndTime, Duration, Distance,
                                FromPlace, ToPlace, BusRoute, Polyline, Created_At)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            history_id,
            leg['mode'],
            leg['aimedStartTime'],
            leg['aimedEndTime'],
            leg['duration'],
            leg['distance'],
            leg['fromPlace']['name'],
            leg['toPlace']['name'],
            leg.get('line', {}).get('publicCode', ''),
            leg.get('pointsOnLink', {}).get('points', '')
        ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Trip saved successfully!"})