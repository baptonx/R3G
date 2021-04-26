import sys

import tensorflow as tf
import numpy as np
import os
from Model.ModelEarlyOC3D_3D import ModelEarlyOC3D_3D
from Tools import DataSetReader
from Tools.Gesture.Morphology import Morphology
from Tools.Gesture.MorphologyGetter import MorphologyGetter
from Tools.Voxelizer.Voxelizer2sqCWM_CuDi_JointsAsVector_SkId import Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId
from Tools.Voxelizer.VoxelizerCWM_CuDi_JointsAsVector import VoxelizerCWMSoupler_CuDi_JointsAsVector
#assert len(physical_devices) > 0, "Not enough GPU hardware devices available"

#configtmp = tf.config.experimental.set_memory_growth(physical_devices[0], True)
physical_devices = tf.config.experimental.list_physical_devices('GPU')
pathFolder = sys.argv[1]
pathFolderOut = sys.argv[2]
pathModel = sys.argv[3]

catCroEnt = tf.keras.losses.CategoricalCrossentropy(reduction=tf.keras.losses.Reduction.SUM_OVER_BATCH_SIZE)


def lossFGWithReject( y_true, y_pred, lambdaHyper):
    # y_true: [batch,nbSeg,nbClass]
    # y_pred: [batch,nbSeg,nbClass]
    loss = catCroEnt(
        tf.repeat(y_pred[:, :, :1], config["nbClass"], axis=2) * y_true,  # g(x)*ytrue * log(pred)
        y_pred[:, :, 1:])
    loss += lambdaHyper * tf.maximum(config["couverture"] - tf.reduce_mean(y_pred[:, :, 0]), 0) ** 2
    return loss


def lossHAux(y_true, y_pred):
    loss = catCroEnt(y_true, y_pred)
    return loss


def loadConfig() -> dict:
    finfo = open(pathModel + "config.txt", "r")
    infos = eval("\n".join(finfo.readlines()))
    finfo.close()
    return infos


separator = "/"
cudi = 0.
voxels = []
config = loadConfig()
dimensionsOutputImage = np.array(list(config["dimensionImage"]))
thresholdCuDi = config["thresholdCuDi"]
thresholdToleranceCuDi = config["thresholdToleranceCuDi"]
thresholdToleranceDrawing = config["thresholdToleranceDrawing"]
jointsSelected = config["jointSelection"]
device: str = config["device"]
nbSkeleton = config["nbSkeleton"]
morph: Morphology = MorphologyGetter.getMorphologyFromDeviceName(device)

if nbSkeleton == 2:
    voxelizer = Voxelizer2sqCWMSoupler_CuDi_JointsAsVector_SkId(dimensionsOutputImage, thresholdToleranceCuDi,
                                                                     False, thresholdCuDi,
                                                                     thresholdToleranceDrawing,
                                                                     morph.nbJoints,
                                                                     jointsSelected)
else:
    voxelizer = VoxelizerCWMSoupler_CuDi_JointsAsVector(dimensionsOutputImage, thresholdToleranceCuDi,
                                                             False, thresholdCuDi, thresholdToleranceDrawing,
                                                             morph.nbJoints,
                                                             jointsSelected)

model = ModelEarlyOC3D_3D(nbClass=config["nbClass"], boxSize=config["boxSize"],
                          doGLU=config["doGlu"], dropoutVal=config["dropoutVal"],
                          denseNeurones=config["denseSize"],
                          denseDropout=config["denseDropout"], nbFeatureMap=config["nbFeatureMap"],
                          dilatationsRates=config["dilatationRates"],
                          maxPoolSpatial=config["maxPoolSpatial"],
                          poolSize=config["poolSize"], poolStrides=config["poolSize"])
opti = tf.keras.optimizers.Adam(learning_rate=config["learning_rate"])
model.compile(opti, loss=[lambda x, y: lossFGWithReject(x, y, config['lambdahyper']),
                          lambda x, y: lossHAux(x, y)], metrics=[])
model.load_weights(pathModel + "Weights" + separator + "model")


def strategyAccept(prediction,rejection,repeat):
    assert len(prediction)==len(rejection)
    assert len(prediction)!=0
    prediction[np.less(rejection,0.5)] = 0
    listeFinalePred = np.repeat(prediction, repeat)
    i = 1
    currClass = listeFinalePred[0]
    startCurrentClass = 0

    bounds = []

    for pred in listeFinalePred:
        if i==len(listeFinalePred):
            break

        if pred!=currClass or i==len(listeFinalePred)-1:
            bounds.append([startCurrentClass,i-1,currClass]) # should be i if i==len(listeSeq)-1 instead of i-1
            currClass = pred
            startCurrentClass = i
        i+=1
    return bounds



listeSeq = os.listdir(pathFolder)
nbJointPerSkeleton = morph.nbJoints
jointsTypes = morph.jointTypes
for seq in listeSeq:
    postures1,postures2 = DataSetReader.readDataPostures(pathFolder+seq,nbSkeleton,morph,config["subSampling"])
    if nbSkeleton == 2:
        voxelizations, repeat = voxelizer.voxelizeTrajectories(postures1, postures2)
    else :
        voxelizations, repeat = voxelizer.voxelizeTrajectories(postures1)
    input = np.array([voxelizations], dtype=np.float)
    prediction = model(input, steps=1, training=False)[0][0]
    rejection = prediction[:, 0].numpy()
    prediction = prediction[:, 1:]
    prediction = tf.argmax(prediction,axis=1).numpy()

    listBoundsTemporelle = strategyAccept(prediction,rejection,repeat)

    f = open(pathFolderOut+seq,"w+")
    f.write("\n".join([str(int(b[2]))+","+str(int(b[0]))+","+str(int(b[1])) for b in listBoundsTemporelle]))
    f.close()
    # rejection = " ".join(["{:.2f}".format(e) for e in rejection])
    # prediction = "    ".join([str(e) for e in prediction])
    # f = open(pathFolderOut+seq,"w+")
    # f.write(str(rejection)+"\n"+str(prediction))
    # f.close()
    # repeatStr = " ".join([str(int(e)) for e in repeat])
    #
    # f = open(pathFolderOut + seq+".repeat", "w+")
    # f.write(repeatStr)
    # f.close()