from dataclasses import dataclass
from typing import Optional
from datetime import datetime, date

@dataclass
class TravelHistory:
    History_ID: int
    User_ID: int
    Trip_ID: str
    Travel_Date: date
    Total_Bus_Duration: Optional[int]
    Total_Bus_Distance: Optional[float]
    Notes: Optional[str]
    Trip_Rating: Optional[float]
    Created_At: datetime
    Updated_At: Optional[datetime]

@dataclass
class TravelQuery:
    Query_ID: int
    User_ID: int
    History_ID: int
    Start_Lat: float
    Start_Lon: float
    End_Lat: float
    End_Lon: float
    dateTime: datetime