from flask import Blueprint, jsonify
from database.connection import get_db_connection

transaction_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transaction_bp.route('/transaction', methods=['GET'])
def get_user_stats():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Set transaction isolation level
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        conn.start_transaction()

        # Advanced Query 1: Join with aggregation (no COALESCE)
        query1 = """
        SELECT 
            u.NickName,
            COUNT(th.History_ID) AS total_trips
        FROM 
            User u
        LEFT JOIN
            TravelHistory th
        ON
            u.User_ID = th.User_ID
        GROUP BY
            u.NickName
        ORDER BY
            total_trips DESC
        LIMIT 5;
        """
        # Execute and fetch first query
        cursor.execute(query1)
        user_stats = cursor.fetchall()  # [(NickName, total_trips), ...]

        # Advanced Query 2: Join with range condition
        query2 = """
        SELECT
            r.Route_Long_Name,
            COUNT(b.Leg_ID) AS leg_count,
            SUM(b.Distance) AS total_distance
        FROM
            BusLeg b
        JOIN
            GTFS_Route r
        ON
            b.BusRoute = r.Route_Short_Name
        GROUP BY
            r.Route_Long_Name
        HAVING
            COUNT(b.Leg_ID) > (
                SELECT
                    AVG(route_usage)
                FROM (
                    SELECT COUNT(*) AS route_usage
                    FROM BusLeg
                    GROUP BY BusRoute
                ) AS usage_summary 
            )
        ORDER BY
            leg_count DESC
        LIMIT
            5;
        """
        # Execute and fetch second query
        cursor.execute(query2)
        route_stats = cursor.fetchall()  # [(Route_Long_Name, leg_count, total_distance), ...]

        conn.commit()
        
        return jsonify({
            "user_leaderboard": user_stats,
            "route_analytics": route_stats
        })
    except Exception as e:
        conn.rollback()
        return jsonify({"error":str(e)}),500
    finally:
        cursor.close()
        conn.close()