from flask import Blueprint, request, jsonify
from database.connection import get_db_connection

leveling_bp = Blueprint('leveling', __name__, url_prefix='/api/leveling')

@leveling_bp.route('/info', methods=['GET'])
def get_leveling_info():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT Total_XP FROM UserXP WHERE User_ID = %s", (user_id,))
        xp_row = cursor.fetchone()
        user_xp = xp_row[0] if xp_row else 0

        cursor.execute("SELECT RankLevel FROM UserRankLevelTracking WHERE User_ID = %s", (user_id,))
        rank_row = cursor.fetchone()
        user_rank = rank_row[0] if rank_row else 'E'

        cursor.execute("SELECT Min_XP, Max_XP FROM XPRankLevelConfig WHERE RankLevel = %s", (user_rank,))
        range_row = cursor.fetchone()
        min_xp, max_xp = range_row if range_row else (0, 100)

        cursor.callproc('getTopUsersByXPAndTrips')
        top_users = []
        for result in cursor.stored_results():
            for row in result.fetchall():
                top_users.append({
                    "nickname": row[1],
                    "totalXP": row[2]
                })

        return jsonify({
            "userXP": user_xp,
            "rank": user_rank,
            "levelMinXP": min_xp,
            "levelMaxXP": max_xp,
            "leaderboard": top_users
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
