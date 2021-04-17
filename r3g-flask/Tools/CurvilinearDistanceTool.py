from collections import Callable, Counter
from typing import List, Tuple

from Tools.Gesture.Joint import Joint
from Tools.Gesture.LabeledSequence import LabeledSequence
from Tools.Gesture.Posture import Posture
import numpy as np


def getCudi(instantT: Posture, instantTP1: Posture, treshToleranceMove,jointSelected):
    getPos: Callable[[List[Joint]], np.array] = lambda joints: np.array(list(map(lambda j: j.position, filter(lambda join:join.jointType.id in jointSelected,joints))))
    """
    getPos : give the array of all positions,
     return dimensions: [NbJoints,3(x,y,z)]
    """
    positionsT = getPos(instantT.joints)
    positionsTP1 = getPos(instantTP1.joints)
    diff = positionsT - positionsTP1
    # remove Unsignicative Displasment with respect to treshToleranceMove
    withoutUnsignicativeDisplasment = map(lambda p: np.linalg.norm(p) if np.linalg.norm(p) > treshToleranceMove else 0,
                                          diff)
    # sum all differences
    return sum(withoutUnsignicativeDisplasment)


def extractLabelPerFrame_ClassAndWindow(sequence: LabeledSequence, numberPosturePerSegment:List[int]) -> Tuple[np.ndarray, np.ndarray]:
    sortedLabels = sorted(sequence.labels, key=lambda l: l.beginPostureId)
    labelsFinal = [[0, 0]] * len(numberPosturePerSegment) # window, class
    repeat = numberPosturePerSegment
    labelClasseTemporel = [0] * len(sequence.postures1)

    currentPosId = 0
    # print("sorted ", sortedLabels)
    for idLabel, label in enumerate(sortedLabels):
        begin = label.beginPostureId
        end = label.endPostureId
        classe = label.classesId
        while currentPosId < end:  # or (idLabel == len(sortedLabels) - 1 and currentPosId < len(labels)):
            if currentPosId < begin:  # how to handle empty classe
                # labels[currentPosId] = [currentPosId - lastActionPos, 0]  # like another action
                currentPosId += 1  # do nothing so will be zero
                continue
            labelClasseTemporel[currentPosId] = classe
            currentPosId += 1

    listeOfLabelsForEachSegmentUsed:List[List[int]] = []
    currentId = 0
    for i, nb in enumerate(repeat):
        listeOfLabelsForEachSegmentUsed.append(labelClasseTemporel[currentId:currentId + nb])
        currentId += nb
    try:
        assert len(listeOfLabelsForEachSegmentUsed) == len(labelsFinal)
    except AssertionError as e:
        print("len(listeOfLabelsForEachSegmentUsed)", len(listeOfLabelsForEachSegmentUsed))
        print("len(labelsFinal)", len(labelsFinal))
        print("len(sequence.repeat)", len(repeat))
        print("sequence.repeat", repeat)
        print("sum(sequence.repeat)", sum(repeat))

        raise e

    for i, listLab in enumerate(listeOfLabelsForEachSegmentUsed):
        mostCommonClasse = Counter(listLab).most_common(1)[0][0]
        labelsFinal[i] = [None, mostCommonClasse]

    currentClasse = 0
    window = 0
    # WARNING: this can lead to problem if the same gesture is done two times at the following, the window wont be reset
    for i, lab in enumerate(labelsFinal):
        clas = lab[1]
        if (clas != currentClasse and clas != 0):
            window = 0
            currentClasse = clas
        elif clas == 0:
            window = 0
        lab[0] = window
        window += 1

    return np.array(labelsFinal), np.array(labelClasseTemporel)
