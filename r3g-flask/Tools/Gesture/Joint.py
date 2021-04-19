from typing import Any, Tuple

from Tools.Gesture import JointType


class Joint:
    def __init__(self, position : Tuple[float,float,float], jointType: JointType):
        self.position = position
        self.jointType = jointType


