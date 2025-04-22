import mysql.connector

def get_db_connection():
    db_config = {
        'host': '34.170.170.60',
        'user': 'jaymalavia',
        'password': 'password',
        'database': 'mtd_eco_leveling',
        'port': 3306
    }
    return mysql.connector.connect(**db_config)