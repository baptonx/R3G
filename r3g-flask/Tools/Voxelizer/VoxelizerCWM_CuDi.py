import math
from typing import Tuple, List, Callable

import numpy as np

from Tools import CurvilinearDistanceTool
from Tools.Voxelizer.VoxelizerHandler import VoxelizerHandler
from Tools.Gesture.Posture import Posture


class VoxelizerCWMSoupler_CuDi(VoxelizerHandler):

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
        super(VoxelizerCWMSoupler_CuDi, self).__init__(sizeBoxInit)
        self.jointSelected:List[int] = jointSelected
        self.doRectifyAngle = doRectifyAngle
        self.tresholdToleranceCuDi = thresholdToleranceCuDi
        self.threshCurviDist = threshCurviDist
        self.thresholdToleranceForVoxelization = thresholdToleranceForVoxelization

    def isOnlyTwoSkeleton(self):
        return True

    def isCuDi(self):
        return True

    def voxelizeTrajectories(self, data: List[Posture]) -> Tuple[List[np.array],List[int]]:
        sizeBoxZ = self.getSizeBoxZ(self.sizeBox)
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



        i = 0
        repeat = []
        while i < len(data) - 1:

            box = np.zeros(shape=[sizeBox[0], sizeBox[1], sizeBoxZ],dtype=bool)

            cudi = 0
            posTPlus1 = data[i]  # just for the first loop
            posturesToDo = [data[i]]
            # print("cudi 0 ",cudi)
            j = 0
            while cudi < self.threshCurviDist and j + i < len(data) - 1:
                posT = posTPlus1
                posTPlus1 = data[i + j + 1]

                cudi += CurvilinearDistanceTool.getCudi(posT, posTPlus1,self.tresholdToleranceCuDi,self.jointSelected)
                # print("cudi sk1 ", cudi)
                # print("cudi sk1+sk2 ", cudi)
                posturesToDo.append(data[i + j + 1])
                j += 1
            # print("j ",j)
            repeat.append(j)

            posT = posturesToDo[0]
            for id in range(1, len(posturesToDo)):
                posTPlus1 = posturesToDo[id]

                if posT.joints[0].jointType.id != 0:  # hip center (kinect v1) or spinebase (kinect v2)
                    raise Exception("Id 0 not spine")

                positionCenter = posT.joints[0].position
                if all(np.array(positionCenter) == zeroArray) :
                    # boxes.append(box)  # empty box if we don't get the positions of the 2 sk
                    skipped += 1
                    continue

                if spines_middle_position is None :
                    # print("frame ",i,"passed in spines middle set")
                    if all(np.array(posT.joints[8].position) == zeroArray) or all(
                            np.array(posT.joints[9].position) == zeroArray) or all(np.array(posT.joints[19].position) == zeroArray):
                        # boxes.append(box)  # empty box if we don't get the positions
                        skipped += 1
                        continue



                    spines_middle_position = np.array(positionCenter)
                    if posT.joints[8].jointType.id != 8 or posT.joints[8].jointType.id != 8:
                        raise Exception("Id 8 not shoulder")

                    shoulder = np.array(posT.joints[8].position)  # indexes ok for both kinect
                    elbow = np.array(posT.joints[9].position)
                    wrist = np.array(posT.joints[10].position)
                    hand = np.array(posT.joints[11].position)
                    head = np.array(posT.joints[3].position)
                    hip = np.array(posT.joints[16].position)
                    foot = np.array(posT.joints[19].position)

                    normBras = np.linalg.norm(elbow - shoulder) + np.linalg.norm(wrist - elbow) + np.linalg.norm(
                        hand - wrist)

                    # normCenterShoulder = np.linalg.norm(shoulder - positionCenter)
                    # normCenterHead = np.linalg.norm(head - positionCenter)
                    # normCenterFoot = np.linalg.norm(positionCenter - hip) + np.linalg.norm(hip - foot)

                    minX = posT.joints[0].position[0] - normBras
                    maxX = posT.joints[0].position[0] + normBras
                    minY = posT.joints[19].position[1] - normBras/5
                    maxY = posT.joints[3].position[1] + normBras/3
                    minZ = posT.joints[0].position[2] - normBras
                    maxZ = posT.joints[0].position[2] + normBras
                    mini = np.array([minX, minY, minZ])
                    maxi = np.array([maxX, maxY, maxZ])


                toCenter = np.array(spines_middle_position) - np.array(positionCenter)
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
                            self.fillBox(box, p[0], p[1], p[2], iJoint, posT, posiT, sizeBox,1-id/len(posturesToDo),0)


                posT = posTPlus1
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

    def fillBox(self, box, x, y, z, jointId, posture: Posture, positionNormalized, sizeBox: np.array,
                shade, skeletonId):
        box[x][y][z] = 1


    def getSizeBoxZ(self, sizeBox):
        return sizeBox[2]

