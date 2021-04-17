from typing import List

from Tools.Gesture.Posture import Posture


class PostureToFile:

    @classmethod
    def toFile(cls,postures : List[Posture],path:str):
        fileLines = []
        for pos in postures:
            line = " ".join(map(lambda j : " ".join(map(lambda x:str(x),j.position)), pos.joints))+"\n"
            fileLines.append(line)

        f = open(path,"w+")
        f.writelines(fileLines)
        f.close()


    @classmethod
    def toFile2Sq(cls,postures : List[Posture],postures2 : List[Posture],path:str):
        fileLines = []
        assert len(postures)==len(postures2)
        for id,pos in enumerate(postures):
            line = " ".join(map(lambda j: " ".join(map(lambda x: str(x), j.position)), pos.joints))
            line += " "+" ".join(map(lambda j: " ".join(map(lambda x: str(x), j.position)), postures2[id].joints)) + "\n"
            fileLines.append(line)

        f = open(path, "w+")
        f.writelines(fileLines)
        f.close()