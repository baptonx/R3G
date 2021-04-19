from abc import ABC, abstractmethod
from typing import List, Tuple

import numpy as np

from Tools.Gesture.LabeledSequence import Label
from Tools.Gesture.Posture import Posture


class VoxelizerHandler(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    def isCuDi(self):
        return False

    def isOnlyTwoSkeleton(self):
        return False

    def nbVoxelisation(self):
        return 1

    @abstractmethod
    def finalSizeBox(self) -> Tuple:
        pass

    def __init__(self, sizeBoxInit):
        self.sizeBox = sizeBoxInit

    @abstractmethod
    def voxelizeTrajectories(self, data: List[Posture]) -> Tuple[List[np.array],List[Label]]:
        """
        :param labels:
        :param data:
        :return:List[ np.array of shape [SizeBox,SizeBox,SizeBox]  ]
        """
        pass

    def getNewListOfPointBetween(self, point1, point2, minDist: float = 1.):
        l: List = [point1]
        current_i = 0
        dist = self.distTo(l[current_i], point2)
        while dist > minDist:
            ratio = minDist / dist
            lastAddedX, lastAddedY, lastAddedZ = l[current_i]
            interP = (lastAddedX + ratio * (point2[0] - lastAddedX),
                      lastAddedY + ratio * (point2[1] - lastAddedY),
                      lastAddedZ + ratio * (point2[2] - lastAddedZ)
                      )
            l.append(interP)
            current_i += 1
            dist = self.distTo(l[current_i], point2)
        l.append(point2)
        return l

    def getNewFixedLenListOfPointBetween(self, point1, point2, nbPoints):
        l: List = []
        dist = self.distTo(point1, point2)
        if dist < 0.00001:
            return [point1] * (nbPoints)
        theRatio = 1 / (nbPoints+1)
        vect = point2-point1

        for i in range(1,nbPoints+1):
            l.append((i*theRatio)*vect+point1)

        assert len(l) == nbPoints

        return l

    def distTo(self, p1, p2):
        return np.linalg.norm([p2[i] - p1[i] for i in range(3)])

    def normalize(self, pos: np.array, mini: np.array,
                  maxi: np.array, sizeBox: np.array):
        """
                  0           min -2        formula : ((v-min)/(max-min))*(sizeBox-1)
                  sizeBox     max  15
        """
        if all(maxi - mini == np.zeros([3])):
            return np.zeros([3])
        posNorm = (pos - mini) / (maxi - mini) * (sizeBox - 1)
        posNorm = [min(sizeBox[i] - 1, posNorm[i]) for i in range(3)]
        posNorm = [max(0, posNorm[i]) for i in range(3)]
        return np.array(posNorm)

    def getMinMax(self, posture: Posture):
        minX = min(posture.joints, key=lambda j: j.position[0]).position[0]
        minY = min(posture.joints, key=lambda j: j.position[1]).position[1]
        minZ = min(posture.joints, key=lambda j: j.position[2]).position[2]

        maxX = max(posture.joints, key=lambda j: j.position[0]).position[0]
        maxY = max(posture.joints, key=lambda j: j.position[1]).position[1]
        maxZ = max(posture.joints, key=lambda j: j.position[2]).position[2]

        return (minX, minY, minZ), (maxX, maxY, maxZ)
