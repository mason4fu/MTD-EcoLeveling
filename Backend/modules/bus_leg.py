from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class BusLeg:
    Leg_ID: int
    History_ID: int
    Mode: str
    StartTime: datetime
    EndTime: datetime
    Duration: int
    Distance: float
    FromPlace: str
    ToPlace: str
    BusRoute: str
    Polyline: str
    Created_At: datetime
    Updated_At: Optional[datetime]