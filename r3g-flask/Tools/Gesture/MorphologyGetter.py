from typing import Tuple, Dict

from Tools.Gesture.JointType import JointType
from Tools.Gesture.Morphology import Morphology
from Tools.Gesture.Posture import Posture
from Tools.Gesture.Tree import Node, Tree


class MorphologyGetter:


    @classmethod
    def kinectV1Morphology(cls):
        hipCenter = Node(JointType(0, "HipCenter"))
        spine = Node(JointType(1, "Spine"))
        shoulderCenter = Node(JointType(2, "shoulderCenter"))
        head = Node(JointType(3, "Head"))
        shoulderLeft = Node(JointType(4, "shoulderLeft"))

        elbowLeft = Node(JointType(5, "elbowLeft"))
        wristLeft = Node(JointType(6, "wristLeft"))
        handLeft = Node(JointType(7, "handLeft"))
        shoulderRight = Node(JointType(8, "shoulderRight"))
        elbowRight = Node(JointType(9, "elbowRight"))
        wristRight = Node(JointType(10, "wristRight"))
        handRight = Node(JointType(11, "handRight"))
        hipLeft = Node(JointType(12, "hipLeft"))
        kneeLeft = Node(JointType(13, "kneeLeft"))
        ankleLeft = Node(JointType(14, "ankleLeft"))
        footLeft = Node(JointType(15, "footLeft"))
        hipRight = Node(JointType(16, "hipRight"))
        kneeRight = Node(JointType(17, "kneeRight"))
        ankleRight = Node(JointType(18, "ankleRight"))
        footRight = Node(JointType(19, "footRight"))

        head.children = [shoulderCenter]
        shoulderCenter.children = [shoulderRight, spine, shoulderLeft]

        shoulderLeft.children = [elbowLeft]
        elbowLeft.children = [wristLeft]
        wristLeft.children = [handLeft]

        shoulderRight.children = [elbowRight]
        elbowRight.children = [wristRight]
        wristRight.children = [handRight]

        spine.children = [hipCenter]
        hipCenter.children = [hipRight, hipLeft]

        hipLeft.children = [kneeLeft]
        kneeLeft.children = [ankleLeft]
        ankleLeft.children = [footLeft]

        hipRight.children = [kneeRight]
        kneeRight.children = [ankleRight]
        ankleRight.children = [footRight]

        jointsDepedenciesKinectV1 = Tree(head)
        jointsTypesNodes = [hipCenter, spine, shoulderCenter, head, shoulderLeft, elbowLeft, wristLeft, handLeft,
                            shoulderRight, elbowRight, wristRight, handRight, hipLeft, kneeLeft, ankleLeft, footLeft,
                            hipRight, kneeRight, ankleRight, footRight]
        jointsTypes = list(map(lambda x: x.value, jointsTypesNodes))

        morphologyKinectv1 = Morphology(20, jointsDepedenciesKinectV1,jointsTypes, MorphologyGetter.centerOnZero,
                                        "kinectV1")

        return morphologyKinectv1

    @classmethod
    def kinectV2Morphology(cls) -> Morphology:
        spineBase = Node(JointType(0, "spineBase"))
        spineMid = Node(JointType(1, "spineMid"))
        neck = Node(JointType(2, "neck"))
        head = Node(JointType(3, "Head"))
        shoulderLeft = Node(JointType(4, "shoulderLeft"))
        elbowLeft = Node(JointType(5, "elbowLeft"))
        wristLeft = Node(JointType(6, "wristLeft"))
        handLeft = Node(JointType(7, "handLeft"))
        shoulderRight = Node(JointType(8, "shoulderRight"))
        elbowRight = Node(JointType(9, "elbowRight"))
        wristRight = Node(JointType(10, "wristRight"))
        handRight = Node(JointType(11, "handRight"))
        hipLeft = Node(JointType(12, "hipLeft"))
        kneeLeft = Node(JointType(13, "kneeLeft"))
        ankleLeft = Node(JointType(14, "ankleLeft"))
        footLeft = Node(JointType(15, "footLeft"))
        hipRight = Node(JointType(16, "hipRight"))
        kneeRight = Node(JointType(17, "kneeRight"))
        ankleRight = Node(JointType(18, "ankleRight"))
        footRight = Node(JointType(19, "footRight"))
        spineShoulder = Node(JointType(20, "spineShoulder"))
        handTipLeft = Node(JointType(21, "handTipLeft"))
        thumbLeft = Node(JointType(22, "thumbLeft"))
        handTipRight = Node(JointType(23, "handTipRight"))
        thumbRight = Node(JointType(24, "thumbRight"))

        head.children = [neck]
        neck.children = [spineShoulder]
        spineShoulder.children = [shoulderRight, spineMid, shoulderLeft]

        shoulderLeft.children = [elbowLeft]
        elbowLeft.children = [wristLeft]
        wristLeft.children = [thumbLeft, handLeft]
        handLeft.children = [handTipLeft]

        shoulderRight.children = [elbowRight]
        elbowRight.children = [wristRight]
        wristRight.children = [handRight, thumbRight]
        handRight.children = [handTipRight]

        spineMid.children = [spineBase]
        spineBase.children = [hipRight, hipLeft]

        hipLeft.children = [kneeLeft]
        kneeLeft.children = [ankleLeft]
        ankleLeft.children = [footLeft]

        hipRight.children = [kneeRight]
        kneeRight.children = [ankleRight]
        ankleRight.children = [footRight]

        jointsDepedenciesKinectV2 = Tree(head)

        jointsTypesNodes = [spineBase, spineMid, neck, head, shoulderLeft, elbowLeft, wristLeft, handLeft,
                            shoulderRight, elbowRight, wristRight, handRight, hipLeft, kneeLeft, ankleLeft, footLeft,
                            hipRight, kneeRight, ankleRight, footRight, spineShoulder, handTipLeft, thumbLeft,
                            handTipRight, thumbRight]
        jointsTypes = list(map(lambda x: x.value, jointsTypesNodes))

        morphologyKinectv2 = Morphology(25, jointsDepedenciesKinectV2,jointsTypes, MorphologyGetter.centerOnZero,
                                        "kinectV2")

        return morphologyKinectv2


    @classmethod
    def centerOnZero(cls,p: Posture) -> Posture:
        """
        normalize in place (p is modified)
        :param p: the posture to normalize
        """
        avX, avY, avZ = 0., 0., 0.
        for joint in p.joints:
            x, y, z = joint.position
            avX += x
            avY += y
            avZ += z
        nb = len(p.joints)
        avX, avY, avZ = avX / nb, avY / nb, avZ / nb
        for i in range(len(p.joints)):
            elemX, elemY, elemZ = p.joints[i].position
            p.joints[i].position = elemX - avX, elemY - avY, elemZ - avZ
        return p  # not needed because done in place


    @classmethod
    def getMorphologyFromDeviceName(cls, device)-> Morphology:
        try:
            test = cls.tab is not None
        except:
            cls.tab = {"KinectV1": cls.kinectV1Morphology(),
                       "KinectV2": cls.kinectV2Morphology()}

        try:
            morph : Morphology = cls.tab[device]
        except:
            raise Exception("The morphology of device "+device+"doesn't exist yet, you must create it in "
                                                               "MorphologyGetter.py")
        return morph
