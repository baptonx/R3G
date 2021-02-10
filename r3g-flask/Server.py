import os

import wandb
import json
from flask import Flask
from os import listdir, walk
from os.path import isfile, join
import re

from Class.Model import Model

app = Flask(__name__)
api = wandb.Api()


#On télécharge tous les fichiers liés aux hyperparamètres d'un model. C'est essentiel pour évaluer une séquence
def downloadHyperparameters():
    runs = api.runs("recoprecoce-intui")
    for run in runs:
        if not os.path.exists("Hyperparameters/" + run.id):
            if run.state == 'finished' and run.tags.count('Liu') > 0:
                for file in run.files():
                    if file.name=="best_val_loss_epochs.txt":
                        file.download("Hyperparameters/"+run.id, replace=True)



def test():
    p = re.compile(r'.*[.](?=inkml$)[^.]*$')
    listeFichiers = []
    for path, dirs, files in walk("./"):
        print(dirs)
        for filename in files:
            if p.match(filename):
                print(path+'/'+filename)
            #print(fichiers)
            #for file in fichiers :
             #   if p.match(file):
              #      listeFichiers.extend(file)
   # print(listeFichiers)
    
#Cette route permet de récupérer la liste des modèles disponible sur Wandb, après filtration (Requete GET)
@app.route('/models/getModelsNames')
def index():
    runs = api.runs("recoprecoce-intui")
    name_list = []
    for run in runs:
        if run.state == 'finished' and run.tags.count('Liu')>0:
            file = api.run("recoprecoce-intui/"+run.id).file("best_val_loss_epochs.txt")
            m = Model(run.id, run.name)
            name_list.append(m.__dict__)
    return json.dumps(name_list)

#cette route permet de recuperer l'ensemble des noms des fichiers
@app.route('/models/getMetaData')
def index2():
    fichiers = [f for f in listdir("./") if isfile(join("./", f))]
    return json.dumps(fichiers)


if __name__ == "__main__":
    #test()
    downloadHyperparameters()
    app.run(host='0.0.0.0')

