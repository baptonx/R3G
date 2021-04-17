from typing import Tuple

import numpy as np

from Tools.Voxelizer.Voxelizer2sqCWM_CuDi_JointsAsVector import \
    Voxelizer2sqCWMSoupler_CuDi_JointsAsVector
from Tools.Gesture.Posture import Posture


class Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId(Voxelizer2sqCWMSoupler_CuDi_JointsAsVector):

    def name(self) -> str:
        return super().name() + "_SkeletonID"

    def __init__(self, sizeBoxInit, thresholdToleranceCuDi, doRectifyAngle, threshCurviDist, thresholdToleranceForVoxelization, nbJoint,jointSelected):
        super(Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId, self).__init__(sizeBoxInit, thresholdToleranceCuDi, doRectifyAngle, threshCurviDist, thresholdToleranceForVoxelization, nbJoint,jointSelected)

    def fillBox(self, box, x, y, z, jointId, posture: Posture, positionNormalized, sizeBox: np.array,nbJointInit:int,shade,skeletonID):
        box[x][y][z] = 1
        box[x][y][sizeBox[2] + self.jointSelected.index(jointId)] = 1
        box[x][y][sizeBox[2] + self.nbJoint+skeletonID] = 1

    def getSizeBoxZ(self, sizeBox, nbJoint):
        return sizeBox[2] + self.nbJoint+2
