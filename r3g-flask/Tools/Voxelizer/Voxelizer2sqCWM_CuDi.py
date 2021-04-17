import copy
import math
from typing import Tuple, List, Callable

import numpy as np

from Tools import CurvilinearDistanceTool
from Tools.Voxelizer.VoxelizerHandler2sq import VoxelizerHandler2sq
from Tools.Gesture.Joint import Joint
from Tools.Gesture.LabeledSequence import Label
from Tools.Gesture.Posture import Posture


class Voxelizer2sqCWMSoupler_CuDi(VoxelizerHandler2sq):

    def finalSizeBox(self) -> Tuple:
        return self.sizeBox[0], self.sizeBox[1], self.sizeBox[2] # self.getSizeBoxZ(self.sizeBox, self.nbJoint)

    def name(self) -> str:
        tol = ""
        if self.thresholdToleranceForVoxelization > 0:
            tol = "Tol" + str(self.thresholdToleranceForVoxelization * 1000)

        return "2sq_CWMSoupler_tresh" +"{:.3f}".format(self.tresholdToleranceCuDi) + "treshCuDi" + str(int(self.threshCurviDist * 1000)) + tol

    def __init__(self, sizeBoxInit, thresholdToleranceCuDi, doRectifyAngle, threshCurviDist, thresholdToleranceForVoxelization,jointSelected:List[int]):
        """

        :param sizeBoxInit: the initial size of the 3D image (without joint and skeleton ID)
        :param thresholdToleranceCuDi: tolerance threshold for consideration into CuDi segment
        :param doRectifyAngle: to make the two skeleton facing the camera, based on vector between two skeletons centers
        :param threshCurviDist: the threshold to reach to fill a segment
        :param thresholdToleranceForVoxelization: all displacement between two frame below this threshold wont be drawn
        """
        super(Voxelizer2sqCWMSoupler_CuDi, self).__init__(sizeBoxInit)
        self.jointSelected:List[int] = jointSelected
        self.doRectifyAngle = doRectifyAngle
        self.tresholdToleranceCuDi = thresholdToleranceCuDi
        self.threshCurviDist = threshCurviDist
        self.thresholdToleranceForVoxelization = thresholdToleranceForVoxelization

    def isOnlyTwoSkeleton(self):
        return True

    def isCuDi(self):
        return True

    def voxelizeTrajectories(self, data: List[Posture],data2:List[Posture]) -> Tuple[List[np.array],List[int]]:
        nbJoint = len(data[0].joints)
        sizeBoxZ = self.getSizeBoxZ(self.sizeBox, nbJoint)
        boxes = []

        sizeBox = np.array(self.sizeBox)
        spines_middle_position = None  # aboslute position center (spines middle)

        minX: float
        minY: float
        minZ: float

        maxX: float
        maxY: float
        maxZ: float
        skipped = 0
        zeroArray = np.zeros([3],dtype=bool)

        assert len(data) == len(data2)


        i = 0
        repeat = []
        while i < len(data) - 1:

            box = np.zeros(shape=[sizeBox[0], sizeBox[1], sizeBoxZ],dtype=bool)

            cudi = 0
            posTPlus1 = data[i]  # just for the first loop
            posTPlus1_sq2 = data2[i]  # just for the first loop
            posturesToDo = [(data[i],data2[i])]
            # print("cudi 0 ",cudi)
            j = 0
            while cudi < self.threshCurviDist and j + i < len(data) - 1:
                posT = posTPlus1
                posT_sq2 = posTPlus1_sq2
                posTPlus1 = data[i + j + 1]
                posTPlus1_sq2 = data2[i + j + 1]

                cudi += CurvilinearDistanceTool.getCudi(posT, posTPlus1,self.tresholdToleranceCuDi,self.jointSelected)
                # print("cudi sk1 ", cudi)
                cudi += CurvilinearDistanceTool.getCudi(posT_sq2, posTPlus1_sq2,self.tresholdToleranceCuDi,self.jointSelected)
                # print("cudi sk1+sk2 ", cudi)
                posturesToDo.append((data[i + j + 1],data2[i + j + 1]))
                j += 1
            # print("j ",j)
            repeat.append(j)

            posT = posturesToDo[0][0]
            posT_sq2 = posturesToDo[0][1]
            for id in range(1, len(posturesToDo)):
                posTPlus1 = posturesToDo[id][0]
                posTPlus1_sq2 = posturesToDo[id][1]

                if posT.joints[0].jointType.id != 0:  # hip center (kinect v1) or spinebase (kinect v2)
                    raise Exception("Id 0 not spine")

                positionCenter = posT.joints[0].position
                positionCenter_sq2 = posT_sq2.joints[0].position
                if all(np.array(positionCenter) == zeroArray) and all(np.array(positionCenter_sq2) == zeroArray):
                    # boxes.append(box)  # empty box if we don't get the positions of the 2 sk
                    skipped += 1
                    continue

                if spines_middle_position is None or onlySk1:
                    # print("frame ",i,"passed in spines middle set")
                    if all(np.array(posT.joints[8].position) == zeroArray) or all(
                            np.array(posT.joints[9].position) == zeroArray) or all(np.array(posT.joints[19].position) == zeroArray):
                        # boxes.append(box)  # empty box if we don't get the positions
                        skipped += 1
                        continue

                    if all(np.array(posT_sq2.joints[8].position) == zeroArray) or all(
                            np.array(posT_sq2.joints[9].position) == zeroArray) or all(
                        np.array(posT_sq2.joints[19].position) == zeroArray):
                        onlySk1=True
                    else :
                        onlySk1= False

                    spines_middle_position = (np.array(positionCenter)+np.array(positionCenter_sq2))/2.
                    if posT.joints[8].jointType.id != 8 or posT.joints[8].jointType.id != 8:
                        raise Exception("Id 8 not shoulder")

                    the_most_to_left_pos, the_most_to_right_pos = (posT_sq2, posT) if\
                                                    positionCenter[0] > positionCenter_sq2[0] else\
                                                    (posT, posT_sq2)

                    the_most_to_back_pos, the_most_to_forward_pos = (posT,posT_sq2) if \
                        positionCenter[2] < positionCenter_sq2[2] else \
                        (posT_sq2,posT)

                    shoulder = np.array(the_most_to_left_pos.joints[8].position)  # indexes ok for both kinect
                    elbow = np.array(the_most_to_left_pos.joints[9].position)
                    wrist = np.array(the_most_to_left_pos.joints[10].position)
                    hand = np.array(the_most_to_left_pos.joints[11].position)
                    head = np.array(the_most_to_left_pos.joints[3].position)
                    hip = np.array(the_most_to_left_pos.joints[16].position)
                    foot = np.array(the_most_to_left_pos.joints[19].position)

                    normBras = np.linalg.norm(elbow - shoulder) + np.linalg.norm(wrist - elbow) + np.linalg.norm(
                        hand - wrist)

                    # normCenterShoulder = np.linalg.norm(shoulder - positionCenter)
                    # normCenterHead = np.linalg.norm(head - positionCenter)
                    # normCenterFoot = np.linalg.norm(positionCenter - hip) + np.linalg.norm(hip - foot)

                    minX = the_most_to_left_pos.joints[0].position[0] - normBras
                    maxX = the_most_to_right_pos.joints[0].position[0] + normBras
                    minY = the_most_to_left_pos.joints[19].position[1] - normBras/5
                    maxY = the_most_to_left_pos.joints[3].position[1] + normBras/3
                    minZ = the_most_to_back_pos.joints[0].position[2] - normBras
                    maxZ = the_most_to_forward_pos.joints[0].position[2] + normBras
                    mini = np.array([minX, minY, minZ])
                    maxi = np.array([maxX, maxY, maxZ])


                toCenter = np.array(spines_middle_position) - (np.array(positionCenter)+np.array(positionCenter_sq2))/2
                for iJoint in range(len(posT.joints)):
                    if iJoint not in self.jointSelected:
                        continue
                    # Skeleton 1
                    posiT = np.array(posT.joints[iJoint].position) + toCenter
                    posiTPlus1 = np.array(posTPlus1.joints[iJoint].position) + toCenter
                    posiT = self.normalize(posiT, mini, maxi, sizeBox)
                    posiTPlus1 = self.normalize(posiTPlus1, mini, maxi, sizeBox)
                    if np.linalg.norm(posiT - posiTPlus1) > self.thresholdToleranceForVoxelization:
                        listPoints = self.getNewListOfPointBetween(posiT, posiTPlus1)
                        pointsInt = list(map(lambda p: (math.floor(p[0]), math.floor(p[1]), math.floor(p[2])), listPoints))
                        for p in pointsInt:
                            self.fillBox(box, p[0], p[1], p[2], iJoint, posT, posiT, sizeBox,nbJoint,1-id/len(posturesToDo),0)

                    # Skeleton 2
                    posiT = np.array(posT_sq2.joints[iJoint].position) + toCenter
                    posiTPlus1 = np.array(posTPlus1_sq2.joints[iJoint].position) + toCenter
                    posiT = self.normalize(posiT, mini, maxi, sizeBox)
                    posiTPlus1 = self.normalize(posiTPlus1, mini, maxi, sizeBox)
                    if np.linalg.norm(posiT - posiTPlus1) > self.thresholdToleranceForVoxelization:
                        listPoints = self.getNewListOfPointBetween(posiT, posiTPlus1)
                        pointsInt = list(map(lambda p: (math.floor(p[0]), math.floor(p[1]), math.floor(p[2])), listPoints))
                        for p in pointsInt:
                            self.fillBox(box, p[0], p[1], p[2], iJoint, posT, posiT, sizeBox, nbJoint, 1-id/len(posturesToDo),1)
                posT = posTPlus1
                posT_sq2 = posTPlus1_sq2
            # end for each postureToDo
            boxes.append(box)
            # print("i ",i," j ", j, "i+j=",i+j)
            i += j

        if skipped != 0:
            print("WARNING : blank box", skipped, "times on", len(data))
        try:
            assert len(boxes)  == len(repeat)
        except AssertionError as e:
            print("len(boxes)",len(boxes))
            print("len(repeat)",len(repeat))
            raise e

        return boxes, repeat

    def fillBox(self, box, x, y, z, jointId, posture: Posture, positionNormalized, sizeBox: np.array, nbJointInit: int,
                shade, skeletonId):
        box[x][y][z] = 1


    def getSizeBoxZ(self, sizeBox, nbJoint):
        return sizeBox[2]

