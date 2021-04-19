from typing import Callable
from Tools.Gesture import Tree
from Tools.Gesture.JointType import JointType


class Morphology:

    def __init__(self, nbJoints: int, jointDependencies: Tree, jointTypes:[JointType],normalisationFunction: Callable,
                 nameMorphology: str,   dimension: int = 3 ):
        """
        :param nbJoints:
        :param jointDependencies: the tree of joints dependencies
        :param normalisationFunction: a function to normalize the skeletton at each frame : Posture-> void (in place)
        :param lenWhenFlattenForDilat1: when
        """

        self.jointTypes = jointTypes
        self.nameMorphology = nameMorphology
        assert Morphology.verifConsistency(nbJoints, jointDependencies)
        self.dimension = dimension
        self.normalisationFunction = normalisationFunction
        self.jointDependencies:Tree = jointDependencies
        self.nbJoints = nbJoints


    @staticmethod  # TODO
    def verifConsistency(nbJoints, jointDependencies):
        return True


    def normalize(self, p):
        """

        :param p: posture
        :return:
        """
        self.normalisationFunction(p)
