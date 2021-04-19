from typing import Tuple

import numpy as np

from Tools.Voxelizer.Voxelizer2sqCWM_CuDi import Voxelizer2sqCWMSoupler_CuDi
from Tools.Gesture.Posture import Posture
from Tools.Voxelizer.VoxelizerCWM_CuDi import VoxelizerCWMSoupler_CuDi


class VoxelizerCWMSoupler_CuDi_JointsAsVector(VoxelizerCWMSoupler_CuDi):

    def finalSizeBox(self) -> Tuple:
        return self.sizeBox[0], self.sizeBox[1], self.getSizeBoxZ( self.sizeBox, self.nbJoint)

    def name(self) -> str:
        return super().name() + "_JointAsVector"

    def __init__(self, sizeBoxInit, thresholdToleranceCuDi, doRectifyAngle, threshCurviDist, thresholdToleranceForVoxelization, nbJoint,jointSelected):
        super(VoxelizerCWMSoupler_CuDi_JointsAsVector, self).__init__(sizeBoxInit, thresholdToleranceCuDi, doRectifyAngle, threshCurviDist, thresholdToleranceForVoxelization,jointSelected)
        self.nbJoint = len(jointSelected)

    def fillBox(self, box, x, y, z, jointId, posture: Posture, positionNormalized, sizeBox: np.array,shade,skeletonID):
        box[x][y][z] = 1
        box[x][y][sizeBox[2] + self.jointSelected.index(jointId)] = 1

    def getSizeBoxZ(self, sizeBox):
        return sizeBox[2] + self.nbJoint
