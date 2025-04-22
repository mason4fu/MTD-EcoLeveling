from dataclasses import dataclass
from typing import Optional

@dataclass
class GTFSRoute:
    Route_ID: str
    Agency_ID: Optional[str]
    Route_Short_Name: Optional[str]
    Route_Long_Name: Optional[str]
    Route_Desc: Optional[str]
    Route_Type: int
    Route_URL: Optional[str]
    Route_Color: Optional[str]
    Route_Text_Color: Optional[str]
    Route_Sort_Order: Optional[int]