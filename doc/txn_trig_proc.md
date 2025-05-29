
- **Transactions:** 
```
START TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Advanced Query 1: Top 5 Users Based On Number Of Trips
SELECT 
    u.NickName,
    COUNT(th.History_ID) AS total_trips
FROM User u
LEFT JOIN TravelHistory th ON u.User_ID = th.User_ID
GROUP BY u.NickName
ORDER BY total_trips DESC
LIMIT 5;

-- Advanced Query 2: Top 5 Routes Based On Number Of Legs
SELECT 
    r.Route_Long_Name,
    COUNT(b.Leg_ID) AS leg_count,
    SUM(b.Distance) AS total_distance
FROM BusLeg b
JOIN GTFS_Route r ON b.BusRoute = r.Route_Short_Name
GROUP BY r.Route_Long_Name
HAVING COUNT(b.Leg_ID) > (
    SELECT AVG(route_usage) 
    FROM (
        SELECT COUNT(*) AS route_usage
        FROM BusLeg
        GROUP BY BusRoute
    ) AS usage_summary
)
ORDER BY leg_count DESC
LIMIT 5;

COMMIT;

```
- **Triggers:**  
```
DELIMITER $$

-- AFTER INSERT: only award XP if the new trip had any bus distance or duration
CREATE TRIGGER after_travelhistory_insert
AFTER INSERT ON TravelHistory
FOR EACH ROW
BEGIN
    DECLARE trip_xp INT DEFAULT 0;

    IF NEW.Total_Bus_Distance > 0 OR NEW.Total_Bus_Duration > 0 THEN
        SET trip_xp = FLOOR(NEW.Total_Bus_Distance 
                           + (NEW.Total_Bus_Duration / 60));

        INSERT INTO UserXP (User_ID, Total_XP, Updated_At)
        VALUES (NEW.User_ID, trip_xp, NOW())
        ON DUPLICATE KEY UPDATE
            Total_XP   = Total_XP + trip_xp,
            Updated_At = NOW();

        CALL updateUserXPAndRank(NEW.User_ID);
    END IF;
END $$
  
-- AFTER UPDATE: only adjust if the XP really changed
CREATE TRIGGER after_travelhistory_update
AFTER UPDATE ON TravelHistory
FOR EACH ROW
BEGIN
    DECLARE new_xp INT DEFAULT 0;
    DECLARE old_xp INT DEFAULT 0;

    SET new_xp = FLOOR(NEW.Total_Bus_Distance 
                       + (NEW.Total_Bus_Duration / 60));
    SET old_xp = FLOOR(OLD.Total_Bus_Distance 
                       + (OLD.Total_Bus_Duration / 60));

    IF new_xp <> old_xp THEN
        UPDATE UserXP
        SET Total_XP   = Total_XP + (new_xp - old_xp),
            Updated_At = NOW()
        WHERE User_ID = NEW.User_ID;

        CALL updateUserXPAndRank(NEW.User_ID);
    END IF;
END $$

-- AFTER DELETE: only subtract if the deleted trip actually had XP
CREATE TRIGGER after_travelhistory_delete
AFTER DELETE ON TravelHistory
FOR EACH ROW
BEGIN
    DECLARE del_xp INT DEFAULT 0;

    SET del_xp = FLOOR(OLD.Total_Bus_Distance 
                       + (OLD.Total_Bus_Duration / 60));

    IF del_xp > 0 THEN
        UPDATE UserXP
        SET Total_XP   = Total_XP - del_xp,
            Updated_At = NOW()
        WHERE User_ID = OLD.User_ID;

        CALL updateUserXPAndRank(OLD.User_ID);
    END IF;
END $$

DELIMITER ;
```
- **Stored Procedures:**  
```
DELIMITER $$

-- Stored procedure to update user's XP and rank
CREATE PROCEDURE updateUserXPAndRank(IN p_user_id INT)
BEGIN
    DECLARE current_total INT;
    DECLARE new_rank CHAR(1);

    SELECT Total_XP INTO current_total
    FROM UserXP
    WHERE User_ID = p_user_id;

    SELECT RankLevel INTO new_rank
    FROM XPRankLevelConfig
    WHERE current_total BETWEEN Min_XP AND Max_XP
    LIMIT 1;

    UPDATE UserRankLevelTracking
    SET RankLevel = new_rank, Updated_At = NOW()
    WHERE User_ID = p_user_id;
END $$

-- Stored procedure to get top users by XP and trip count
CREATE PROCEDURE getTopUsersByXPAndTrips()
BEGIN
    DECLARE v_count INT DEFAULT 0;

    -- 1) Advanced query #1: count how many users meet the avg-XP threshold
    SELECT
      COUNT(DISTINCT u.User_ID)
    INTO v_count
    FROM User AS u
    JOIN UserXP AS xp   ON u.User_ID = xp.User_ID
    JOIN TravelHistory AS th ON u.User_ID = th.User_ID
    WHERE xp.Total_XP > (
      SELECT AVG(Total_XP) FROM UserXP
    );

    -- 2) Control structure: if nobody qualifies, return a message
    IF v_count = 0 THEN
        SELECT 'No users exceed the average XP threshold' AS Info;
    ELSE
        -- 3) Advanced query #2: the original top-10 SELECT
        SELECT 
            u.User_ID,
            u.Nickname,
            xp.Total_XP,
            COUNT(th.History_ID) AS TripCount
        FROM 
            User AS u
        JOIN 
            UserXP AS xp ON u.User_ID = xp.User_ID
        JOIN 
            TravelHistory AS th ON u.User_ID = th.User_ID
        GROUP BY 
            u.User_ID, u.Nickname, xp.Total_XP
        HAVING 
            xp.Total_XP > (SELECT AVG(Total_XP) FROM UserXP)
        ORDER BY 
            xp.Total_XP DESC,
            TripCount DESC
        LIMIT 10;
    END IF;
END $$

DELIMITER ;
```
