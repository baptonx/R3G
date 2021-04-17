class Label:
    def __init__(self, classe, classesId, beginPostureId, endPostureId,fileName="",actionPoint = -1):
        self.fileName = fileName
        self.classesId = classesId
        self.endPostureId = endPostureId
        self.beginPostureId = beginPostureId
        self.classe = classe
        self.actionPoint = actionPoint

    def __repr__(self) -> str:
        return str(self)

    def __str__(self) -> str:
        return f"(fileName : {self.fileName};classe : {self.classe},classid : {self.classesId}, begin : {self.beginPostureId}, end : {self.endPostureId})"
