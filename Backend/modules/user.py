from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class User:
    User_ID: int
    Nickname: str
    Email: str
    Password_Hash: str
    Created_At: datetime
    Updated_At: Optional[datetime]

@dataclass
class UserXP:
    User_ID: int
    Total_XP: int
    Updated_At: Optional[datetime]

@dataclass
class UserRankLevelTracking:
    User_ID: int
    RankLevel: str
    Updated_At: datetime

@dataclass
class XPRankLevelConfig:
    RankLevel: str
    Min_XP: int
    Max_XP: int