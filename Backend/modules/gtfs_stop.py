from dataclasses import dataclass
from typing import Optional

@dataclass
class GTFSStop:
    Stop_ID: str
    Stop_Name: str
    Stop_Lat: float
    Stop_Lon: float
    Stop_Code: Optional[str]
    Stop_URL: Optional[str]