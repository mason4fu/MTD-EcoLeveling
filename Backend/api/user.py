from flask import Blueprint, request, jsonify
from database.connection import get_db_connection

user_bp = Blueprint('user', __name__, url_prefix='/api/users')

@user_bp.route('/search', methods=['POST'])
def search_user():
    data = request.get_json()
    nickname = data.get('nickname')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    #Get the user's nickname, totalXP, co2Saved, and rank from UserRankLevelTracking
    query = """SELECT 
u.Nickname AS nickname, 
xp.Total_XP AS totalXP, 
(xp.Total_XP * 0.05) AS co2Saved, 
ur.RankLevel AS userRank
FROM User u
JOIN UserXP xp ON u.User_ID = xp.User_ID
JOIN UserRankLevelTracking ur ON u.User_ID = ur.User_ID
WHERE LOWER(u.Nickname) = LOWER(%s)
"""
    cursor.execute(query, (nickname,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    cursor.close()
    conn.close()

    user['co2Saved'] = round(user['co2Saved'], 2)

    return jsonify(user)
