from typing import List, Tuple, Union

from Model.ModelEarlyOC3D_3D import ModelEarlyOC3D_3D
from Tools import DataSetReader, CurvilinearDistanceTool
from Tools.Gesture.Morphology import Morphology
from Tools.Gesture.MorphologyGetter import MorphologyGetter
from Tools.Gesture.Posture import Posture
import tensorflow as tf
import numpy as np
from Tools.Voxelizer.Voxelizer2sqCWM_CuDi_JointsAsVector_SkId import Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId
import Tools.CurvilinearDistanceTool
from Tools.Voxelizer.VoxelizerCWM_CuDi_JointsAsVector import VoxelizerCWMSoupler_CuDi_JointsAsVector

catCroEnt = tf.keras.losses.CategoricalCrossentropy(reduction=tf.keras.losses.Reduction.SUM_OVER_BATCH_SIZE)



class OnlineExecuterOC3D:

    lastPostures1:List[Posture] = []
    lastPostures2:List[Posture] = []


    def __init__(self, pathModel:str):
        self.pathModel = pathModel
        separator = "\\"
        self.cudi = 0.
        self.voxels = []
        self.config = self.loadConfig()
        dimensionsOutputImage = np.array(list( self.config["dimensionImage"]))
        self.thresholdCuDi = self.config["thresholdCuDi"]
        self.nbSkeleton = self.config["nbSkeleton"]
        self.thresholdToleranceCuDi = self.config["thresholdToleranceCuDi"]
        self.thresholdToleranceDrawing = self.config["thresholdToleranceDrawing"]
        self.jointsSelected = self.config["jointSelection"]
        device: str = self.config["device"]
        self.morph: Morphology = MorphologyGetter.getMorphologyFromDeviceName(device)


        if self.nbSkeleton == 2:
            self.voxelizer = Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId(dimensionsOutputImage,self.thresholdToleranceCuDi,
                                                                False,self.thresholdCuDi,self.thresholdToleranceDrawing,self.morph.nbJoints,
                                                                self.jointsSelected)
        else:
            self.voxelizer = VoxelizerCWMSoupler_CuDi_JointsAsVector(dimensionsOutputImage,self.thresholdToleranceCuDi,
                                                                False,self.thresholdCuDi,self.thresholdToleranceDrawing,self.morph.nbJoints,
                                                                self.jointsSelected)

        self.model = ModelEarlyOC3D_3D(nbClass=self.config["nbClass"], boxSize=self.config["boxSize"],
                                  doGLU=self.config["doGlu"], dropoutVal=self.config["dropoutVal"],
                                  denseNeurones=self.config["denseSize"],
                                  denseDropout=self.config["denseDropout"], nbFeatureMap=self.config["nbFeatureMap"],
                                  dilatationsRates=self.config["dilatationRates"], maxPoolSpatial=self.config["maxPoolSpatial"],
                                  poolSize=self.config["poolSize"], poolStrides=self.config["poolSize"])
        opti = tf.keras.optimizers.Adam(learning_rate=self.config["learning_rate"])
        self.model.compile(opti, loss=[lambda x, y: self.lossFGWithReject(x, y, self.config['lambdahyper']), lambda x,y: self.lossHAux(x,y)], metrics=[])
        self.model.load_weights(pathModel + "Weights" + separator + "model")


    def lossFGWithReject(self, y_true, y_pred, lambdaHyper):
        # y_true: [batch,nbSeg,nbClass]
        # y_pred: [batch,nbSeg,nbClass]
        loss = catCroEnt(
            tf.repeat(y_pred[:, :, :1], self.config["nbClass"], axis=2) * y_true,  # g(x)*ytrue * log(pred)
            y_pred[:, :, 1:])
        loss += lambdaHyper * tf.maximum(self.config["couverture"] - tf.reduce_mean(y_pred[:, :, 0]), 0) ** 2
        return loss

    def lossHAux(self,y_true, y_pred):
        loss = catCroEnt(y_true, y_pred)
        return loss

    def doExec(self,data:str)-> Tuple[int,float,int]:
        timeStamp,data = data.split(';')
        posture1, posture2 = self.readPosture(data)

        # posture1, posture2 = self.filterData(posture1)
        self.lastPostures1.append(posture1)
        if posture2 is not None:
            self.lastPostures2.append(posture2)
        if len(self.lastPostures1)==1:
            return timeStamp,None, None


        self.cudi += CurvilinearDistanceTool.getCudi(self.lastPostures1[-2], posture1, self.thresholdToleranceCuDi, self.jointsSelected)
        if posture2 is not None:
            self.cudi += CurvilinearDistanceTool.getCudi(self.lastPostures2[-2], posture2, self.thresholdToleranceCuDi, self.jointsSelected)


        if self.cudi < self.thresholdCuDi:
            return timeStamp,None, None

        if self.nbSkeleton == 2:
            voxelizations, repeat = self.voxelizer.voxelizeTrajectories(self.lastPostures1,self.lastPostures2)
        else:
            voxelizations, repeat = self.voxelizer.voxelizeTrajectories(self.lastPostures1)

        assert len(voxelizations)==1
        self.cudi=0
        self.lastPostures1 = self.lastPostures1[-1:]
        if posture2 is not None:
            self.lastPostures2 = self.lastPostures2[-1:]
        self.voxels.append(voxelizations[0])
        self.voxels = self.voxels[-128:]
        input = np.array([self.voxels],dtype=np.float)
        print(input.shape)
        prediction = self.model(input,steps=1,training=False)[0][0]
        rejection = prediction[-1, 0]
        prediction = prediction[-1, 1:]
        prediction = tf.argmax(prediction).numpy()

        return timeStamp, rejection.numpy(), prediction





    def readPosture(self, data: str)->Tuple[Posture,Union[Posture,None]]:
        """
         transform the data in a posutre
        :param data
        """

        skel1: Posture
        skel2: Posture
        skel1,skel2 = DataSetReader.readOneLine(data, self.morph, self.nbSkeleton)

        return skel1,skel2 # skel2 can be none




    def loadConfig(self)->dict:
        finfo = open(self.pathModel + "config.txt", "r")
        infos = eval("\n".join(finfo.readlines()))
        finfo.close()
        return infos

    def filterData(self, posture1):
        return posture1

