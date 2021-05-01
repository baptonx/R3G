from typing import Tuple, List

import tensorflow as tf
from tensorflow.keras.layers import Conv3D
from enum import Enum

class ModeTestChannel(Enum):
    ONLY_FINGER_POS = 1
    ONLY_TRACE = 2
    BOTH = 3
class ModelEarlyOC3D_3D(tf.keras.Model):

    def __init__(self, nbClass, doGLU: bool = True, dropoutVal: float = 0.2, boxSize: Tuple[int, int, int] = (16, 16, 1),
                 denseNeurones: int = 30, denseDropout: float = 0.3, nbFeatureMap: int = 16,
                 dilatationsRates: List[int] = None, maxPoolSpatial=True,poolSize=(1,3,3),poolStrides=(1,3,3),
                 nbLayerDense=1,modeChannel : ModeTestChannel=ModeTestChannel.BOTH):
        super(ModelEarlyOC3D_3D, self).__init__()
        self.modeChannel = modeChannel
        self.maxPoolSpatial = maxPoolSpatial
        self.kernelSize1 = [2, 3, 3]
        self.nbLayerDense = nbLayerDense
        self.poolSize = None
        self.poolStrides = None
        if self.maxPoolSpatial:
            self.poolSize = poolSize
            self.poolStrides = poolStrides
            self.maxPoolSpatialLayerValid = tf.keras.layers.MaxPool3D(pool_size=self.poolSize, strides=self.poolStrides,
                                                                      padding="valid")
            self.maxPoolSpatialLayerSame = tf.keras.layers.MaxPool3D(pool_size=self.poolSize, strides=self.poolStrides,#(1,1,1), # to keep the dimension
                                                                     padding="same")

        self.denseDropout = denseDropout

        self.DENSE_NEURONS = denseNeurones
        self.NB_FEATURE_MAP = nbFeatureMap
        self.dropoutVal = dropoutVal
        self.boxSize = boxSize
        self.doGLU = doGLU
        self.nbClass = nbClass+1 # +1 for the background

        if dilatationsRates is None:
            self.dilatationsRates = [1, 2, 4, 8, 16,1,2,4,8,16]
        else:
            self.dilatationsRates = dilatationsRates

        self.nbFeatureMaps = [self.boxSize[-1]] + [self.NB_FEATURE_MAP] * len(self.dilatationsRates)

        self.initLayers()

        self.reluClassif = tf.keras.layers.ReLU()
        self.layersDense = []
        for i in range(self.nbLayerDense):
            denseLayer = tf.keras.layers.Dense(self.DENSE_NEURONS, activation="relu", name="first_layerClassif"+str(i))
            self.layersDense.append(denseLayer)
        self.dropout1Classif = tf.keras.layers.Dropout(self.denseDropout)

        self.classi = tf.keras.layers.Dense(self.nbClass, activation="softmax", name="classification")
        self.auxiliaire = tf.keras.layers.Dense(self.nbClass, activation="softmax", name="classification_aux")
        self.selectionHead_1 = tf.keras.layers.Dense(self.DENSE_NEURONS, activation="relu", name="select1")
        self.selectionHead_final = tf.keras.layers.Dense(1, activation="sigmoid", name="selectFinal")

        self.concat = tf.keras.layers.Concatenate()#default axis is -1

        # self.masker = tf.keras.layers.Masking(mask_value=-2.)

    def initLayers(self):
        self.layersConv = []
        self.layersConvGLU = []

        self.dropout = []
        self.addLayer = tf.keras.layers.Add()
        if self.doGLU:
            self.multi = tf.keras.layers.Multiply()

        for id, dilatRate in enumerate(self.dilatationsRates):
            activ = "linear" if self.doGLU else "relu"
            if id == 0:
                if self.modeChannel==ModeTestChannel.ONLY_TRACE or self.modeChannel==ModeTestChannel.ONLY_FINGER_POS:
                    self.boxSize = (self.boxSize[0], self.boxSize[1], 1)
                conv = Conv3D(filters=self.nbFeatureMaps[id + 1], kernel_size=self.kernelSize1, strides=1,
                              activation=activ,
                              padding="valid",
                              input_shape=[None, self.boxSize[0], self.boxSize[1], self.boxSize[2]],
                              dilation_rate=[dilatRate, 1, 1], name="ConvLayer" + str(id) + "Dilat" + str(dilatRate))
            else:
                conv = Conv3D(filters=self.nbFeatureMaps[id + 1], kernel_size=self.kernelSize1, strides=1,
                              activation=activ,
                              padding="valid",
                              dilation_rate=[dilatRate, 1, 1], name="ConvLayer" + str(id) + "Dilat" + str(dilatRate))

            self.layersConv.append(conv)

            if self.doGLU:
                # for GLU activation function
                conv2 = Conv3D(filters=self.nbFeatureMaps[id + 1], kernel_size=self.kernelSize1, strides=1,
                               activation="sigmoid", padding="valid",
                               dilation_rate=[dilatRate, 1, 1],
                               name="GLUConvLayer" + str(id) + "Dilat" + str(dilatRate))
                self.layersConvGLU.append(conv2)

            if self.dropoutVal > 0:
                dropOut = tf.keras.layers.Dropout(self.dropoutVal)
                self.dropout.append(dropOut)

    def call(self, x, training=True, **kwargs):
        # x shape : [Batch,#segments,Xdim,Ydim,17]
        # _ = self.masker(x)  # just to init masker
        # theMask = self.masker.compute_mask(x)  # compute where the images have been padded
        # theMask = tf.reduce_all(tf.reduce_all(theMask, axis=2), axis=2)  # [batch,seq(True/False)]
        # tf.print("x x ",tf.shape(x))
        # print("x x ",x)
        if(self.modeChannel==ModeTestChannel.ONLY_FINGER_POS):
            x = x[:, :, :, :, 1:2] # only the secondChannel
        elif (self.modeChannel==ModeTestChannel.ONLY_TRACE):
            x = x[:, :, :, :, :1]
        maxlength = tf.shape(x)[1]  # because it's padded
        maxlengthX = tf.shape(x)[2]
        maxlengthY = tf.shape(x)[3]

        results = []
        # convolutions part
        for idLayer, layer in enumerate(self.layersConv):
            inputBrut = x

            # causal pad on seg
            pads = tf.multiply(layer.dilation_rate, tf.convert_to_tensor(layer.kernel_size) - 1)
            topadSeq, topadX, topadY = pads[0], pads[1], pads[2]

            # the dimension is reduced because of convolutions non padded, fill with zero to left to keep causality
            # topadSeq = maxlength - tf.shape(x)[1] #useless
            topadX = maxlengthX + topadX - tf.shape(x)[2]  # can at be each side
            topadY = maxlengthY + topadY - tf.shape(x)[3]


            paddings = [[0, 0], [topadSeq, 0], [topadX // 2, topadX - topadX // 2], [topadY // 2, topadY - topadY // 2],
                        [0, 0]]  # on the second dimension pad BEFORE (topad values) of 0.
            # paddings = [[0, 0], [topadSeq, 0], [topadX, 0], [topadY , 0],
            #             [0, 0]]

            x = tf.pad(x, paddings=paddings, mode="CONSTANT",
                       constant_values=0.)  # padded -> [bbatch, seq(pad), x,y,50]

            tmp = x
            # tf.print("after pad shape of x ",tf.shape(x))
            x = layer(x)  # x -> [batch, seg(reduced), x(reduced),y(reduced),50]
            # tf.print("after conv shape of x ",tf.shape(x))
            # tf.print("shape of x ",tf.shape(x))
            # GLU
            if self.doGLU:
                xGLU = self.layersConvGLU[idLayer](tmp)  # x2-> [batch, seq, x,y,50]
                x = self.multi([x, xGLU])  # x-> [batch, seq, x,y,50]

            if (self.dropoutVal > 0):
                x = self.dropout[idLayer](x)



            toAdd = x
            if self.maxPoolSpatial:
                toAdd = self.maxPoolSpatialLayerValid(toAdd)  # [ batch, seg(pad), x(pooled),y(pooled),50 ]
                # tf.print("Shape of x just b4 maxpool", tf.shape(x))
                x = self.maxPoolSpatialLayerSame(x)  # [ batch, seg(pad), x,y,50 ]
            # tf.print("after maxPoolSpatial shape of x ",tf.shape(x))

            results.append(toAdd)  # results -> [ batch, seg(pad), x(pooled),y(pooled),50 ]
            # add for residual connections
            if idLayer > 0:
                x = self.addLayer([x, inputBrut])

        # results shape =  (layers,batch, seq(pad), x,y,50) ]
        if not self.maxPoolSpatial:
            shapeRes = [self.boxSize[0], self.boxSize[1]]
        else:
            shapeRes = [(self.boxSize[0] - self.poolSize[1]) // self.poolStrides[1] + 1,
                        (self.boxSize[1] - self.poolSize[2]) // self.poolStrides[2] + 1]

        resConv = tf.reduce_mean(results, axis=0)  # resConv -> (batch, seq(pad), x,y,50)

        resConv = tf.reshape(resConv,
                             shape=[-1, maxlength, shapeRes[0] * shapeRes[1] * self.nbFeatureMaps[-1]])

        resClassif = self.reluClassif(resConv)  # [batch, seq(pad), x*y*50]
        for denseLayer in self.layersDense:
            resClassif = denseLayer(resClassif)  # [batch, seq(pad), 50]
        resClassif = self.dropout1Classif(resClassif)

        #classfication head
        resClassifPred = self.classi(resClassif)  # [batch, sequence, nbClasse]

        # selection head
        resSelection = self.selectionHead_1(resClassif)  # [batch, sequence, nbClasse]
        resSelection = self.selectionHead_final(resSelection)  # [batch, sequence, 1]

        # auxilaire head
        resAuxiliaire = self.auxiliaire(resClassif)  # [batch, sequence, nbClasse]

        resConcat = self.concat([resSelection,resClassifPred])#reject(1) + nbClass+1(background)
        # tf.print("after resConcat shape of x ", tf.shape(resConcat))


        # resConcatWithoutPad = tf.boolean_mask(resConcat, theMask)  # [batch*nbSequence -masked ,nbclasse]
        # resAuxiliaireWithoutPad = tf.boolean_mask(resAuxiliaire, theMask)  # [batch*nbSequence -masked ,nbclasse]
        return resConcat, resAuxiliaire
