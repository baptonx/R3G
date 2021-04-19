from typing import List

from Tools.Gesture import Morphology
from Tools.Gesture.Joint import Joint


class Posture:
    def __init__(self, joints: List[Joint], morphology: Morphology, normalize=False):
        self.joints = joints
        self.morphology = morphology
        if normalize:
            morphology.normalize(self)
        self.mappingJointTypePosition = dict()
        self.updateMapping()

    def updateMapping(self):
        for j in self.joints:
            self.mappingJointTypePosition[j.jointType.id] = j.position

    def toListOfFloat(self)->List[List[float]]:
        liste = []
        for j in self.joints:
            liste.append(list(j.position))
        return liste

    def __repr__(self):
        return str(self)

    def __str__(self):
        return "Obj.Posture"
