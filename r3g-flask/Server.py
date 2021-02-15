import os

import wandb
import json
from flask import Flask
from os import listdir, walk
from os.path import isfile, join
import re
import xml.etree.ElementTree as ET

from Class.Hyperparameters import Hyperparameters
from Class.Model import Model

app = Flask(__name__)
api = wandb.Api()
runs = api.runs("recoprecoce-intui")
model_list=[]
liste_fichier_inkml = []


#On télécharge tous les fichiers liés aux hyperparamètres d'un model. C'est essentiel pour évaluer une séquence
# Ca peut etre assez long, donc on le fait avant de run le serv
def downloadHyperparameters():
    for run in runs:
        if not os.path.exists("Hyperparameters/" + run.id):
            if run.state == 'finished' and run.tags.count('maxPoolBetLayers') > 0:
                for file in run.files():
                    if file.name=="best_val_loss_epochs.txt":
                        file.download("Hyperparameters/"+run.id, replace=True)



def recherche_fichier_inkml():
    p = re.compile(r'.*[.](?=inkml$)[^.]*$')
    for path, dirs, files in walk(".\BDD"):
        for filename in files:
            if p.match(filename):
                liste_fichier_inkml.append(path+'\\'+filename)
    print(liste_fichier_inkml)

def ouverture_fichier_inkml(index):
    print(liste_fichier_inkml[index])
    tree=ET.parse(liste_fichier_inkml[index])
    root = tree.getroot()
    for child in root:
         print(child.tag, child.attrib)
         for children in child:
             print(children.tag, children.attrib, children.text)
         
                #print(fichiers)
            #for file in fichiers :
             #   if p.match(file):
              #      listeFichiers.extend(file)
   # print(listeFichiers)


# Au lancement du serveur, on crée des objets de type Model contenant le nom l'id et une liste d'hyperparamètres pour chaque
# modèles présent sur le board Wandb. On recupère les hyperparamètres grace au fichier best_val_loss_epochs.txt,
# le nom grace a run.name et l'id grace à run.id
# param est un dictionnaire permettant de créer des objets Hyperparamètres pour chaque modèle
def startAPIWandb():
    param = {}
    for run in runs:
        if run.state == 'finished' and run.tags.count('maxPoolBetLayers') > 0:
            if os.path.exists("Hyperparameters/" + run.id + "/best_val_loss_epochs.txt"):
                param[run.id] = []
                with open("Hyperparameters/" + run.id + "/best_val_loss_epochs.txt", "r") as f:
                    for line in f.readlines():
                        if "argv:" in line:
                            for elt in (line.replace("']\n", "").split(":['")[1]).split("', "):
                                param[run.id].append(Hyperparameters(elt.split("=")[0], elt.split("=")[1]).__dict__)
                m = Model(run.id, run.name, param[run.id])
                model_list.append(m.__dict__)

    
#Cette route permet de récupérer la liste des modèles disponible sur Wandb, après avoir filtré les tags, ainsi que les
# hyperparamètres stockés dans les fichiers best_val_epochs.txt
@app.route('/models/getModelsNames')
def getModelsNames():
    return json.dumps(model_list)


#Cette route permet de récupérer un modèle en donnant son id en paramètre
@app.route('/models/getModel/<id>')
def getModel(id):
    for elt in model_list:
        if elt["_id"]==id:
            return json.dumps(elt)



#cette route permet de recuperer l'ensemble des noms des fichiers
@app.route('/models/getMetaData')
def index2():
    fichiers = [f for f in listdir("./") if isfile(join("./", f))]
    return json.dumps(fichiers)


if __name__ == "__main__":
    #recherche_fichier_inkml()
    #ouverture_fichier_inkml(2)
    downloadHyperparameters()
    startAPIWandb()
    app.run(host='0.0.0.0')


